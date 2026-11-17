import { Animation, createAnimation } from '@ionic/angular';

export const slidePageAnimation = (
  _baseEl: HTMLElement,
  opts?: any
): Animation => {
  const enteringEl = opts?.enteringEl;
  const leavingEl = opts?.leavingEl;

  const root = createAnimation().duration(180).easing('ease-out');

  if (enteringEl) {
    root.addAnimation(
      createAnimation()
        .addElement(enteringEl)
        .beforeStyles({
          visibility: 'visible',
        })
        .fromTo('opacity', '0', '1')
    );
  }

  if (leavingEl) {
    root.addAnimation(
      createAnimation().addElement(leavingEl).fromTo('opacity', '1', '0')
    );
  }

  return root;
};
