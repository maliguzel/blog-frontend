/**
 * lib/hizmet-gruplari-utils.ts
 *
 * Firestore/Firebase bağımlılığı yoktur.
 * /api/hizmet-gruplari route'undan dönen `veriler` objesi ile çalışır.
 */

export type Grup = "A" | "B" | "C" | "D" | "E";
export type BolgeNo = "1" | "2" | "3" | "4" | "5" | "6";

export type HizmetGruplariVerisi = Record<
    string,
    Partial<Record<BolgeNo, Partial<Record<Grup, string[]>>>>
>;

const GRUPLAR: Grup[] = ["A", "B", "C", "D", "E"];
const BOLGELER: BolgeNo[] = ["1", "2", "3", "4", "5", "6"];

const TR_MAP: Record<string, string> = {
    ş: "s",
    Ş: "s",
    ç: "c",
    Ç: "c",
    ğ: "g",
    Ğ: "g",
    ü: "u",
    Ü: "u",
    ö: "o",
    Ö: "o",
    ı: "i",
    İ: "i",
    I: "i",
};

export function normalizeTr(text: string | null | undefined): string {
    if (!text) return "";

    let sonuc = String(text).trim();

    for (const [kaynak, hedef] of Object.entries(TR_MAP)) {
        sonuc = sonuc.split(kaynak).join(hedef);
    }

    return sonuc.toLowerCase().replace(/\s+/g, " ").trim();
}

function isValidVeriler(veriler: unknown): veriler is HizmetGruplariVerisi {
    return !!veriler && typeof veriler === "object" && !Array.isArray(veriler);
}

export function getUnvanListesi(veriler: unknown): string[] {
    if (!isValidVeriler(veriler)) return [];

    return Object.keys(veriler).sort((a, b) => a.localeCompare(b, "tr"));
}

export function getIlListesi(veriler: unknown): string[] {
    if (!isValidVeriler(veriler)) return [];

    const ilSet = new Set<string>();

    for (const unvanVerisi of Object.values(veriler)) {
        if (!unvanVerisi || typeof unvanVerisi !== "object") continue;

        for (const bolge of BOLGELER) {
            const bolgeVerisi = unvanVerisi[bolge];
            if (!bolgeVerisi || typeof bolgeVerisi !== "object") continue;

            for (const grup of GRUPLAR) {
                const iller = bolgeVerisi[grup];

                if (!Array.isArray(iller)) continue;

                for (const il of iller) {
                    if (typeof il === "string" && il.trim()) {
                        ilSet.add(il.trim());
                    }
                }
            }
        }
    }

    return Array.from(ilSet).sort((a, b) => a.localeCompare(b, "tr"));
}

export function unvanAnahtariBul(
    veriler: unknown,
    arananUnvan: string,
): string | null {
    if (!isValidVeriler(veriler)) return null;

    const hedef = normalizeTr(arananUnvan);

    if (!hedef) return null;

    const bulunan = Object.keys(veriler).find(
        (unvan) => normalizeTr(unvan) === hedef,
    );

    return bulunan ?? null;
}

export type IlGrubuBulundu = {
    bulundu: true;
    unvan: string;
    il: string;
    bolge: BolgeNo;
    grup: Grup;
};

export type IlGrubuBulunamadi = {
    bulundu: false;
    error: string;
};

export type IlGrubuSonucu = IlGrubuBulundu | IlGrubuBulunamadi;

export function ilGrubuBul(
    veriler: unknown,
    unvan: string,
    il: string,
): IlGrubuSonucu {
    if (!isValidVeriler(veriler)) {
        return {
            bulundu: false,
            error: "Hizmet grupları verisi geçerli değil.",
        };
    }

    const gercekUnvan = unvanAnahtariBul(veriler, unvan);

    if (!gercekUnvan) {
        return {
            bulundu: false,
            error: "Seçilen unvan bulunamadı.",
        };
    }

    const unvanVerisi = veriler[gercekUnvan];
    const hedefIl = normalizeTr(il);

    for (const bolge of BOLGELER) {
        const bolgeVerisi = unvanVerisi?.[bolge];
        if (!bolgeVerisi) continue;

        for (const grup of GRUPLAR) {
            const ilListesi = bolgeVerisi[grup];

            if (!Array.isArray(ilListesi)) continue;

            const eslesenIl = ilListesi.find(
                (adayIl) => normalizeTr(adayIl) === hedefIl,
            );

            if (eslesenIl) {
                return {
                    bulundu: true,
                    unvan: gercekUnvan,
                    il: eslesenIl,
                    bolge,
                    grup,
                };
            }
        }
    }

    return {
        bulundu: false,
        error: "Seçilen unvan ve il için bölge/grup bilgisi bulunamadı.",
    };
}

export type AltBolgeSonucu =
    | {
          uygun: true;
          mevcut: {
              il: string;
              bolge: BolgeNo;
              grup: Grup;
          };
          hedefler: {
              D: string[];
              E: string[];
          };
          uyari: string;
      }
    | {
          uygun: false;
          mevcut?: {
              il: string;
              bolge: BolgeNo;
              grup: Grup;
          };
          hedefler: {
              D: string[];
              E: string[];
          };
          sebep: string;
      };

export function altBolgeHedefleri(
    veriler: unknown,
    unvan: string,
    mevcutIl: string,
): AltBolgeSonucu {
    if (!isValidVeriler(veriler)) {
        return {
            uygun: false,
            hedefler: {
                D: [],
                E: [],
            },
            sebep: "Hizmet grupları verisi geçerli değil.",
        };
    }

    const mevcut = ilGrubuBul(veriler, unvan, mevcutIl);

    if (!mevcut.bulundu) {
        return {
            uygun: false,
            hedefler: {
                D: [],
                E: [],
            },
            sebep: mevcut.error,
        };
    }

    if (mevcut.grup !== "A" && mevcut.grup !== "B") {
        return {
            uygun: false,
            mevcut: {
                il: mevcut.il,
                bolge: mevcut.bolge,
                grup: mevcut.grup,
            },
            hedefler: {
                D: [],
                E: [],
            },
            sebep: "Madde 26 kapsamında sadece A veya B grubu illerden D veya E grubu illere başvuru değerlendirilebilir.",
        };
    }

    const bolgeVerisi = veriler[mevcut.unvan]?.[mevcut.bolge];

    const hedefD = Array.isArray(bolgeVerisi?.D)
        ? bolgeVerisi.D.filter(
              (il) => normalizeTr(il) !== normalizeTr(mevcut.il),
          )
        : [];

    const hedefE = Array.isArray(bolgeVerisi?.E)
        ? bolgeVerisi.E.filter(
              (il) => normalizeTr(il) !== normalizeTr(mevcut.il),
          )
        : [];

    return {
        uygun: true,
        mevcut: {
            il: mevcut.il,
            bolge: mevcut.bolge,
            grup: mevcut.grup,
        },
        hedefler: {
            D: hedefD,
            E: hedefE,
        },
        uyari: "Bu sonuç kesin tayin hakkı anlamına gelmez. Münhal kadro, PDC doluluk oranı ve Bakanlık değerlendirmesi ayrıca dikkate alınır.",
    };
}

/**
 * Kullanım örneği:
 *
 * const res = await fetch("/api/hizmet-gruplari");
 * const json = await res.json();
 * const veriler = json.data.veriler;
 *
 * const unvanlar = getUnvanListesi(veriler);
 * const iller = getIlListesi(veriler);
 * const sonuc = ilGrubuBul(veriler, "hemsire", "adana");
 * const hedefler = altBolgeHedefleri(veriler, "hemsire", "adana");
 */
