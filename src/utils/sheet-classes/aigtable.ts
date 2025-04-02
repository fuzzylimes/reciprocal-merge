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

      const [Prevdate, Prevdoses] = Base.prevCalculations.getDuAndTimesByRowLabel(aig.duMonthCell);
      const atr: aigTableRecord = {
        AIG: aig.label,
        Prevdate,
        Prevdoses,
        currentdate,
        currentdoses: aigData.month ?? 0,
        Change: { t: 'f', f: `IFS($B${i + 1}>$D${i + 1},"LOWER",$B${i + 1}<$D${i + 1},"HIGHER",$B${i + 1}=$D${i + 1},"NO CHANGE")` },
        Changedose: { t: 'f', f: `IFS($C${i + 1}>$E${i + 1},"LOWER",$C${i + 1}<$E${i + 1},"HIGHER",$C${i + 1}=$E${i + 1},"NO CHANGE")` },
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
