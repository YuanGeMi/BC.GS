type AdminPerf = {
  id: string;
  mark: (step: string, extra?: string) => void;
  end: (extra?: string) => void;
};

const noopPerf: AdminPerf = {
  id: "",
  mark() {},
  end() {},
};

export function adminPerfStart(_label: string): AdminPerf {
  return noopPerf;
}
