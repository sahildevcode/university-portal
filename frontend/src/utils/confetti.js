import confetti from 'canvas-confetti';

export const fireCelebration = (origin = { x: 0.5, y: 0.6 }) => {
  try {
    // School Colors: Gold & Navy & Emerald
    const colors = ['#C59B27', '#071530', '#10B981', '#F59E0B', '#3B82F6'];
    
    // Wave 1: Center burst
    confetti({
      particleCount: 40,
      spread: 60,
      origin,
      colors,
      ticks: 200,
      gravity: 1.2,
      scalar: 1,
      shapes: ['square', 'circle']
    });

    // Wave 2: Star burst slightly delayed
    setTimeout(() => {
      confetti({
        particleCount: 25,
        angle: 60,
        spread: 55,
        origin: { x: origin.x - 0.1, y: origin.y },
        colors,
        ticks: 220
      });
      confetti({
        particleCount: 25,
        angle: 120,
        spread: 55,
        origin: { x: origin.x + 0.1, y: origin.y },
        colors,
        ticks: 220
      });
    }, 150);
  } catch (err) {
    console.warn('Confetti effect unavailable:', err);
  }
};
