type SegmentControlProps = {
  enabled?: boolean;
  onIndexChange?: (index: number) => void;
  onValueChange?: (value: string) => void;
  selectedIndex?: number;
  values: string[];
  materialTextClassName?: string;
  /**
   * If true, then selecting a segment won't persist visually. The onValueChange callback will still work as expected.
   */
  iosMomentary?: boolean;
};

export type { SegmentControlProps };
