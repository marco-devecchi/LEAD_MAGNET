import { useState, useRef, useEffect } from "react"
import { addPropertyControls, ControlType } from "framer"

/* ======================================================
   MODIFICA QUI: nessuna proprieta nel pannello.
   Va dopo il Riconoscimento e prima del Metodo:
   il lettore ha appena ammesso di avere il problema,
   e la domanda successiva e' "e tu chi sei".

   Titolo sezione = H2. Titoli delle due colonne = H3.

   IN FRAMER: altezza del livello su "Fit Content".
   ====================================================== */

const OCCHIELLO = "Vent'anni fra il codice e il tavolo delle trattative"
const TITOLO = "Ho scritto codice e ho scritto offerte"

const INTRO =
    "Nasco tecnico: il primo codice delle mie aziende l'ho scritto io. Poi ho passato vent'anni a costruire e a vendere progetti tecnologici a clienti che non potevano permettersi un errore."

const COLONNE = [
    {
        titolo: "Chi conosce solo la tecnologia",
        testo: "Sa dire se un sistema regge. Ma non ha mai scritto un'offerta, e non sa dove un fornitore mette il margine, cosa lascia fuori dal perimetro e quale voce crescerà il secondo anno.",
    },
    {
        titolo: "Chi conosce solo il mercato",
        testo: "Sa negoziare un contratto. Ma non sa se quello che sta comprando funzionerà davvero, e se ne accorge quando il progetto è partito e i soldi sono già impegnati.",
    },
]

/* La foto sta a destra delle due schede. Si carica dal pannello a destra,
   voce "Foto". Il testo alternativo e' scritto qui sotto perche' Google
   legge quello, non il nome del file. */
const TESTO_ALT = "Marco de Vecchi, fractional executive IT per le PMI"

const CHIUSURA = {
    prima: "Io ho fatto tutte e due le cose, sugli stessi progetti.",
    oro: "Quando leggo un'offerta so cosa è stato lasciato fuori, perché quelle offerte le ho scritte io.",
}

// == TIPOGRAFIA ========================================
// desktop = px esatti da 1200 di larghezza in su
// mobile  = px esatti da 390 in giu, in mezzo si interpola
// peso: 400 Regular, 500 Medium, 600 SemiBold, 700 Bold
const FONT = "Montserrat, system-ui, -apple-system, 'Segoe UI', sans-serif"

const SCALA = { mobileFinoA: 390, desktopDa: 1200 }

const TIPO = {
    h2: { desktop: 40, mobile: 26, peso: 500, colore: "#FFFFFF", crenatura: "-0.02em", interlinea: 1.2 },
    h3: { desktop: 20, mobile: 17, peso: 600, colore: "#FFFFFF", crenatura: "-0.01em", interlinea: 1.3 },
    occhiello: { desktop: 12, mobile: 11, peso: 600, colore: "#E0A33C", crenatura: "0.15em", interlinea: 1.5 },
    intro: { desktop: 18, mobile: 15, peso: 400, colore: "#C9C6C0", crenatura: "0", interlinea: 1.6 },
    paragrafo: { desktop: 16, mobile: 14, peso: 400, colore: "#B0ACA4", crenatura: "0", interlinea: 1.55 },
    chiusura: { desktop: 20, mobile: 16, peso: 500, colore: "#BFBCB6", crenatura: "0", interlinea: 1.5 },
}
// ======================================================

const S = {
    larghezzaMax: 1060,
    dueColonneSopra: 780,

    // quota di larghezza per il testo e per la foto, quando stanno affiancati
    larghezzaTesto: 0.58,
    larghezzaFoto: 0.42,
    fotoAffiancataSopra: 900, // sotto questa larghezza la foto va in fondo
    fotoLarghezzaMax: 380,
    fotoImpilata: 300,

    // [minimo, fattore, massimo]
    padSopra: [44, 0.05, 90],
    padSotto: [44, 0.05, 90],
    padLaterale: [22, 0.034, 48],
    spazioSottoOcchiello: [12, 0.014, 20],
    spazioSottoTitolo: [14, 0.018, 24],
    spazioSottoIntro: [32, 0.04, 62],
    spazioTraColonne: [18, 0.024, 34],
    padScheda: [22, 0.026, 34],
    spazioSopraChiusura: [26, 0.032, 50],
    raggio: 12,
}

const C = {
    sfondo: "#202020",
    scheda: "#272727",
    bordo: "rgba(245,243,239,0.16)",
    bordoOro: "rgba(224,163,60,0.32)",
    accento: "#E0A33C",
    testo: "#F5F3EF",
}

/* =============== FINE BLOCCO DA MODIFICARE =============== */

/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight auto
 * @framerIntrinsicWidth 1440
 * @framerIntrinsicHeight 560
 * @framerDisableUnlink
 */
export default function EsperienzaMarcoDeVecchi({ image = undefined, style = undefined }) {
    const ref = useRef(null)
    const [w, setW] = useState(1440)

    useEffect(() => {
        const el = ref.current
        if (!el) return
        const update = () => setW(el.offsetWidth || 1440)
        update()
        if (typeof ResizeObserver === "undefined") return
        const ro = new ResizeObserver(update)
        ro.observe(el)
        return () => ro.disconnect()
    }, [])

    const f = ([min, factor, max]) =>
        Math.round(Math.min(max, Math.max(min, w * factor)))
    const t = (k) => {
        const d = TIPO[k]
        const r = Math.min(
            1,
            Math.max(
                0,
                (w - SCALA.mobileFinoA) / (SCALA.desktopDa - SCALA.mobileFinoA)
            )
        )
        return {
            fontFamily: FONT,
            fontSize: Math.round(d.mobile + (d.desktop - d.mobile) * r),
            fontWeight: d.peso,
            lineHeight: d.interlinea,
            letterSpacing: d.crenatura,
            color: d.colore,
        }
    }

    const due = w >= S.dueColonneSopra
    const affiancata = w >= S.fotoAffiancataSopra
    const padS = f(S.padScheda)

    return (
        <div
            ref={ref}
            style={{
                width: "100%",
                display: "block",
                background: C.sfondo,
                color: C.testo,
                fontFamily: FONT,
                lineHeight: 1.6,
                boxSizing: "border-box",
                ...style,
            }}
        >
            <div
                style={{
                    width: "100%",
                    maxWidth: S.larghezzaMax,
                    margin: "0 auto",
                    padding: `${f(S.padSopra)}px ${f(S.padLaterale)}px ${f(S.padSotto)}px`,
                    boxSizing: "border-box",
                }}
            >
                {OCCHIELLO ? (
                    <div
                        style={{
                            ...t("occhiello"),
                            textTransform: "uppercase",
                            marginBottom: f(S.spazioSottoOcchiello),
                        }}
                    >
                        {OCCHIELLO}
                    </div>
                ) : null}

                <h2
                    style={{
                        margin: `0 0 ${f(S.spazioSottoTitolo)}px`,
                        ...t("h2"),
                        maxWidth: "20ch",
                    }}
                >
                    {TITOLO}
                </h2>

                <p
                    style={{
                        margin: `0 0 ${f(S.spazioSottoIntro)}px`,
                        ...t("intro"),
                        maxWidth: "62ch",
                    }}
                >
                    {INTRO}
                </p>

                <div
                    style={{
                        display: "flex",
                        flexDirection: affiancata ? "row" : "column",
                        alignItems: affiancata ? "stretch" : "center",
                        gap: f(S.spazioTraColonne),
                    }}
                >
                <div
                    style={{
                        flex: affiancata ? `1 1 ${S.larghezzaTesto * 100}%` : "1 1 auto",
                        width: "100%",
                        display: "grid",
                        gridTemplateColumns: due && !affiancata
                            ? "repeat(2, minmax(0,1fr))"
                            : "minmax(0,1fr)",
                        gap: f(S.spazioTraColonne),
                        alignContent: "start",
                    }}
                >
                    {COLONNE.map((c, i) => (
                        <div
                            key={i}
                            style={{
                                background: C.scheda,
                                border: `1px solid ${C.bordo}`,
                                borderRadius: S.raggio,
                                padding: padS,
                                boxSizing: "border-box",
                            }}
                        >
                            <h3 style={{ margin: "0 0 10px", ...t("h3") }}>
                                {c.titolo}
                            </h3>
                            <p style={{ margin: 0, ...t("paragrafo") }}>
                                {c.testo}
                            </p>
                        </div>
                    ))}
                </div>

                {image ? (
                    <div
                        style={{
                            flex: affiancata
                                ? `0 1 ${S.larghezzaFoto * 100}%`
                                : "0 0 auto",
                            display: "flex",
                            alignItems: "flex-end",
                            justifyContent: "center",
                            maxWidth: affiancata
                                ? S.fotoLarghezzaMax
                                : S.fotoImpilata,
                            width: "100%",
                        }}
                    >
                        <img
                            src={typeof image === "string" ? image : image?.src}
                            srcSet={typeof image === "string" ? undefined : image?.srcSet}
                            alt={TESTO_ALT}
                            style={{
                                width: "100%",
                                height: "auto",
                                display: "block",
                                objectFit: "contain",
                            }}
                        />
                    </div>
                ) : null}
                </div>

                <div
                    style={{
                        marginTop: f(S.spazioSopraChiusura),
                        background: C.scheda,
                        border: `1px solid ${C.bordoOro}`,
                        borderRadius: S.raggio,
                        padding: padS,
                        boxSizing: "border-box",
                    }}
                >
                    <p style={{ margin: 0, ...t("chiusura"), maxWidth: "64ch" }}>
                        {CHIUSURA.prima}{" "}
                        <b style={{ color: C.accento, fontWeight: 600 }}>
                            {CHIUSURA.oro}
                        </b>
                    </p>
                </div>
            </div>
        </div>
    )
}

addPropertyControls(EsperienzaMarcoDeVecchi, {
    image: {
        type: ControlType.ResponsiveImage,
        title: "Foto",
        description:
            "Sta a destra delle due schede. Sotto i 900px di larghezza scende in fondo alla sezione.",
    },
})
