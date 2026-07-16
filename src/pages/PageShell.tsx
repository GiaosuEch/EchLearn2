import type React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Mascot from '../components/mascot/Mascot';

interface StubPageProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  backTo?: string | (() => void);
}

export default function PageShell({ title, description, icon, children, backTo }: StubPageProps) {
  const { t } = useTranslation();
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {backTo && (typeof backTo === 'string' ? (
          <Link to={backTo} className="inline-flex items-center gap-1 text-sm text-dark-400 hover:text-primary-400 mb-4 transition-colors"><ArrowLeft size={16} /> {t('common.back')}</Link>
        ) : (
          <button onClick={backTo} className="inline-flex items-center gap-1 text-sm text-dark-400 hover:text-primary-400 mb-4 transition-colors"><ArrowLeft size={16} /> {t('common.back')}</button>
        ))}
        <div className="flex items-center gap-3">
          {icon && <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center text-primary-400">{icon}</div>}
          <div>
            <h1 className="text-2xl font-bold text-white">{title}</h1>
            {description && <p className="text-dark-400 text-sm">{description}</p>}
          </div>
        </div>
      </motion.div>
      {children || (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="glass-card p-8 text-center">
          <Mascot expression="thinking" size={80} message={t('empty.no_content')} />
          <p className="mt-4 text-dark-400">{t('empty.no_content')}</p>
        </motion.div>
      )}
    </div>
  );
}
