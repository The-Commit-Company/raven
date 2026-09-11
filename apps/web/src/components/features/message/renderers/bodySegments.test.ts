import { describe, expect, it } from "vitest"
import { parseBodySegments } from "./RichTextRenderer"

// Shapes only — flags and counts. The React nodes themselves are covered by
// rendering in the app.
const shape = (html: string) =>
    parseBodySegments(html).map((segment) => ({ standalone: segment.standalone, jumbo: segment.jumbo }))

describe("parseBodySegments", () => {
    it("keeps plain paragraphs as one bubbled segment", () => {
        expect(shape("<p>hello</p><p>world</p>")).toEqual([{ standalone: false, jumbo: false }])
    })

    it("breaks a code block out of the text run", () => {
        expect(shape('<p>before</p><pre><code class="language-js">x()</code></pre><p>after</p>')).toEqual([
            { standalone: false, jumbo: false },
            { standalone: true, jumbo: false },
            { standalone: false, jumbo: false },
        ])
    })

    it("renders a code-only message as one bare segment", () => {
        expect(shape("<pre><code>x()</code></pre>")).toEqual([{ standalone: true, jumbo: false }])
    })

    it("breaks a lone GIF paragraph out as bare", () => {
        expect(shape('<p>look</p><p><img src="https://media.tenor.com/abc.gif"></p>')).toEqual([
            { standalone: false, jumbo: false },
            { standalone: true, jumbo: false },
        ])
    })

    it("keeps an inline GIF (text around it) inside the bubble", () => {
        expect(shape('<p>look at this <img src="https://media.tenor.com/abc.gif"></p>')).toEqual([
            { standalone: false, jumbo: false },
        ])
    })

    it("keeps a lone custom emoji as a bare jumbo segment", () => {
        expect(shape('<p><img data-type="customEmoji" src="/files/party.png" alt=":party:"></p>')).toEqual([
            { standalone: true, jumbo: true },
        ])
    })

    it("renders an emoji-only message as one bare jumbo segment", () => {
        expect(shape("<p>\u{1F600}\u{1F389}</p>")).toEqual([{ standalone: true, jumbo: true }])
    })

    it("does not treat an emoji message with text as jumbo", () => {
        expect(shape("<p>nice \u{1F600}</p>")).toEqual([{ standalone: false, jumbo: false }])
    })
})
