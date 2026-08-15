import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router';
import type { ReadonlyDeep } from 'type-fest';
import { getProductPackForLanguage, type ProductPack } from '../curriculum/courseRegistry';
import { useAppStore } from '../stores/appStore';
import { useAuthStore } from '../stores/authStore';
import { useProAccess } from './useProAccess';
import { canUseEntitlementLanguages } from '../services/entitlementService';
import { progressService } from '../services/progressService';
import { resolveNextLesson } from '../viewmodels/roadmapProgress';
import { toast } from '../components/ui/Toast';

export function useCourseRoadmap() {
  const [searchParams] = useSearchParams();
  const currentLanguage = useAppStore((state) => state.currentLanguage);
  const setCurrentLanguage = useAppStore((state) => state.setCurrentLanguage);
  const user = useAuthStore((state) => state.user);
  
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);
  const [productPack, setProductPack] = useState<ReadonlyDeep<ProductPack> | null>(null);
  const [isLoadingPack, setIsLoadingPack] = useState(true);
  const navigate = useNavigate();

  const { plan: activePlan, flags: proFlags, isResolving: isResolvingPlan } = useProAccess();
  const selectedLangs = useMemo(
    () => user?.targetLanguages ?? [currentLanguage],
    [user?.targetLanguages, currentLanguage],
  );

  // Handle Language & Entitlements
  useEffect(() => {
    const requestedLanguage = searchParams.get('lang') || currentLanguage;
    const testLanguages = Array.from(new Set([...selectedLangs, requestedLanguage]));
    const canUse = proFlags.unlockAllLanguages || canUseEntitlementLanguages(activePlan, testLanguages);
    
    // Wait for the authoritative plan before bouncing anyone.
    if (!canUse && !isResolvingPlan) {
      toast(`Ngôn ngữ (${requestedLanguage.toUpperCase()}) cần mở khóa gói cước GO, PLUS hoặc PRO. Đang tới Bảng giá...`, 'warning');
      navigate('/app/pricing');
      return;
    }
    
    if (requestedLanguage && requestedLanguage !== currentLanguage) {
      setCurrentLanguage(requestedLanguage);
    }
  }, [currentLanguage, searchParams, setCurrentLanguage, activePlan, proFlags.unlockAllLanguages, isResolvingPlan, selectedLangs, navigate]);

  // Load Product Pack
  useEffect(() => {
    const controller = new AbortController();
    setIsLoadingPack(true);
    getProductPackForLanguage(currentLanguage, controller.signal)
      .then(pack => {
        if (!controller.signal.aborted) {
          setProductPack(pack);
          setIsLoadingPack(false);
        }
      })
      .catch((err) => {
        if (!controller.signal.aborted) {
          console.error("Failed to load product pack:", err);
          setIsLoadingPack(false);
        }
      });
      
    return () => { controller.abort(); };
  }, [currentLanguage]);

  // Load Progress
  useEffect(() => {
    if (!user?.id) return;
    progressService.getCompletedLessons(user.id)
      .then(setCompletedLessonIds)
      .catch(() => setCompletedLessonIds([]));
  }, [user?.id]);

  const modules = useMemo(() => productPack?.units || [], [productPack]);
  const completedLessonsCount = modules.flatMap((module) => module.lessons).filter((lesson) => completedLessonIds.includes(lesson.id)).length;
  const totalLessonsCount = modules.flatMap((module) => module.lessons).length;
  
  const nextLesson = useMemo(() => resolveNextLesson(modules, completedLessonIds), [completedLessonIds, modules]);

  const nextRealworldSurvivalLesson = useMemo(() => {
    if (!productPack) return undefined;
    const allLessons = productPack.units.flatMap(unit => unit.lessons);
    return allLessons.find((l) => !completedLessonIds.includes(l.id));
  }, [completedLessonIds, productPack]);

  const nextLessonUrl = useMemo(() => {
    if (!productPack) return '/app/practice';
    if (productPack.features.find(f => f.bannerType === 'realworld')) {
      return nextRealworldSurvivalLesson ? `/app/lesson?id=${nextRealworldSurvivalLesson.id}` : '/app/practice';
    }
    return nextLesson?.path ?? '/app/practice';
  }, [productPack, nextRealworldSurvivalLesson, nextLesson]);

  return {
    isLoadingPack,
    productPack,
    completedLessonIds,
    completedLessonsCount,
    totalLessonsCount,
    nextLessonUrl,
    modules,
    nextLessonId: nextLesson?.lessonId || nextRealworldSurvivalLesson?.id
  };
}
