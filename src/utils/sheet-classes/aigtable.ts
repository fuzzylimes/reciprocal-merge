import { WorkBook } from "xlsx";
import { Base } from "./Base";
import { aigTableRecord, headers } from "../sheets";
import { aigLookup } from "../aig-helper";

export class aigtable extends Base {
  record: aigTableRecord[] | undefined;

  constructor(outData: WorkBook) {
    super(outData, 'aigtable', headers.aigTable);
  }

  async build() {
    const rows: aigTableRecord[] = [];
    for (let i = 1; i <= 20; i++) {
      const aig = aigLookup[i];
      const aigData = Base.aigData[aig.aigReference];

      const currentdate = aigData.times ?? 0.0;

      if (currentdate < 2.0) continue;

      const rl = rows.length + 2;
      const [Prevdoses, Prevdate] = Base.prevCalculations.getDuAndTimesByRowLabel(aig.duMonthCell);
      const atr: aigTableRecord = {
        AIG: aig.label,
        Prevdate,
        Prevdoses,
        currentdate,
        currentdoses: aigData.month ?? 0,
        Change: { t: 'f', f: `IFS($B${rl}>$D${rl},"LOWER",$B${rl}<$D${rl},"HIGHER",$B${rl}=$D${rl},"NO CHANGE")` },
        Changedose: { t: 'f', f: `IFS($C${rl}>$E${rl},"LOWER",$C${rl}<$E${rl},"HIGHER",$C${rl}=$E${rl},"NO CHANGE")` },
      }
      rows.push(atr);
    }

    this.record = rows;
    this.data = this.getDataObject();

    await super.build();
  }

  getDataObject() {
    const data: unknown[][] = []
    if (this.record) {
      for (const r of this.record) {
        const d = [];
        for (const i of this.headers) {
          d.push(r[i as keyof aigTableRecord])
        }
        data.push(d);
      }
      return data;
    } else {
      return [data];
    }
  }
}
