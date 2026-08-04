# Ech Buri Animated SVG Design

## Goal

Replace the landing hero and dashboard mascot artwork with an original, code-native Ech Buri SVG that remains crisp at every size and uses smooth Motion-driven interaction.

## Scope

- Create `EchBuriAnimated`, a self-contained React SVG component with `idle`, `hover`, and `success` visual states.
- Use only solid fills and bold strokes. The asset must contain no gradients, raster artwork, filters, drop shadows, external files, or brand marks.
- Render idle breathing and blinking when motion is enabled; render a short celebration with SVG confetti when `state="success"`.
- Use the existing `motion/react` dependency; do not add Lottie, GIFs, or any dependencies.
- Respect the existing `mascotAnimation` user setting and the operating system’s reduced-motion preference.
- Replace the hero mascot and dashboard mascot artwork only. Existing mascot uses elsewhere remain untouched.

## Component contract

```ts
type EchBuriAnimationState = 'idle' | 'success';

interface EchBuriAnimatedProps {
  size?: number;
  state?: EchBuriAnimationState;
  animate?: boolean;
  className?: string;
}
```

The root is an accessible decorative SVG (`role="img"`, Vietnamese `aria-label`) contained in a hoverable Motion wrapper. `animate={false}` or reduced motion selects a static pose.

## Visual and motion design

- Character: lime-green frog, navy hoodie, teal open book, dark ink outlines, leaf sprout, and orange bookmark accent.
- Idle: a 3.2-second ease-in-out body loop limited to `transform`; eyes blink using a 5.4-second scale-Y keyframe with a staggered delay.
- Hover: pointer hover raises the wrapper by 8px and performs one small rotation/scale bounce. No continuous hover loop.
- Success: a 680ms spring lift, raised arm/book pose, and six small flat-colour SVG confetti pieces. It resolves to the idle pose.
- Performance: animation targets transform/opacity only; wrapper opts into `will-change: transform` while enabled.

## Integration

- `CinematicHero` renders `EchBuriAnimated size={240}` in place of `Mascot` and preserves its adjacent tutor emote.
- `DashboardPage` renders a compact idle instance in the study-plan card and replaces the encouragement banner’s legacy mascot emote with `EchBuriAnimated`.
- The static `Mascot` component and generated PNG remain unchanged so unrelated screens have no visual regression.

## Verification

- Add a source-level contract test that checks the component’s public states, reduced-motion handling, and transform-only GPU hint.
- Run the targeted test, then `npx.cmd tsc --noEmit`, `npm.cmd run test`, and `npm.cmd run build`.
