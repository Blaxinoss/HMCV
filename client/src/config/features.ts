const isEnabled = (value: string | undefined) => value?.toLowerCase() === 'true';

export const features = Object.freeze({
  demoMode: isEnabled(import.meta.env.VITE_DEMO_MODE),
});
