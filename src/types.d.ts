export type PrintHistory = {
  startTime: Date;
  actualPrintTime: number;
  calculatedPrintTime: number;
  status: 'printed' | 'aborted';
  printer: string;
  costs: number;
};

export type WeeklyPrintCount = {
  weekStart: Date;
  printCount: number;
};
