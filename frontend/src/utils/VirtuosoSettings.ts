const cores = navigator.hardwareConcurrency || 4

let performanceLevel = 'low'

if (cores >= 8) performanceLevel = 'high'
else if (cores >= 6) performanceLevel = 'mid'

export const virtuosoSettings = {
  increaseViewportBy: performanceLevel === 'high' ? 800 : performanceLevel === 'mid' ? 500 : 300,
  overscan: performanceLevel === 'high' ? 80 : performanceLevel === 'mid' ? 50 : 30,
  initialItemCount: performanceLevel === 'high' ? 50 : performanceLevel === 'mid' ? 30 : 15,
  defaultItemHeight: 60,
  scrollSeekConfiguration: {
    enter: (v: number) =>
      performanceLevel === 'high'
        ? Math.abs(v) > 2000
        : performanceLevel === 'mid'
          ? Math.abs(v) > 1000
          : Math.abs(v) > 600,
    exit: (v: number) =>
      performanceLevel === 'high'
        ? Math.abs(v) < 100
        : performanceLevel === 'mid'
          ? Math.abs(v) < 50
          : Math.abs(v) < 30,
    change: () => null
  }
}
