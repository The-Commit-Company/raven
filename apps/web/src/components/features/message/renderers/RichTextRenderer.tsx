import { useMemo, useState } from "react"
import parse, { Element, domToReact, type DOMNode, type HTMLReactParserOptions } from "html-react-parser"
import { UserMention, ChannelMention } from "./MessageMention"
import { CodeBlock } from "./MessageCodeBlock"
import { cn } from "@lib/utils"
import _ from "@lib/translate"

/**
 * Renders a message body from the HTML the backend stores in `message.text`
 * (Tiptap's `getHTML()` output). We render HTML directly — NOT through a Tiptap
 * editor instance. The performance guide's core advice is to never mount an
 * editor you don't need, and a virtualized stream would otherwise spin up one
 * ProseMirror instance per row. `html-react-parser` builds React elements, so
 * `<script>` never executes and inline `on*=` handlers never bind; the only
 * residual vector is anchor href schemes, which we sanitize below.
 *
 * Output is wrapped in `.tiptap` — the SAME class Tiptap puts on its editor
 * root — so reading and editing share one stylesheet (see styles/rich-text.css).
 */

/** Schemes safe to keep on an <a href>. Everything else (javascript:, data:) is dropped. */
const SAFE_HREF = /^(https?:|mailto:|tel:|\/|#)/i

/** Custom-emoji image src: same-origin (relative) or http(s) only — never data:/js:. */
const SAFE_IMG_SRC = /^(https?:|\/)/i

/** Visible text of a node, minus a leading @/# — the fallback mention label. */
const mentionLabel = (node: Element): string =>
    node.children
        .map((child) => (child as { data?: string }).data ?? "")
        .join("")
        .replace(/^[@#]/, "")
        .trim()

/** Spoiler: hidden behind a block until clicked (keyboard-accessible). */
const Spoiler = ({ children }: { children: React.ReactNode }) => {
    const [revealed, setRevealed] = useState(false)
    return (
        <span
            className={cn("message-spoiler", revealed && "message-spoiler--revealed")}
            role="button"
            tabIndex={revealed ? -1 : 0}
            aria-label={revealed ? undefined : _("Spoiler — click to reveal")}
            onClick={() => !revealed && setRevealed(true)}
            onKeyDown={(e) => {
                if (!revealed && (e.key === "Enter" || e.key === " ")) {
                    e.preventDefault()
                    setRevealed(true)
                }
            }}
        >
            {children}
        </span>
    )
}

/** Recursively concatenate a node's text content (for code-block bodies). */
const textContent = (node: DOMNode): string => {
    if ((node as { type?: string }).type === "text") return (node as { data?: string }).data ?? ""
    if (node instanceof Element) return (node.children as DOMNode[]).map(textContent).join("")
    return ""
}

const options: HTMLReactParserOptions = {
    replace: (node) => {
        if (!(node instanceof Element)) return

        // Strip author classes. v2 Raven baked presentational utilities (e.g.
        // `text-sm`) into the stored HTML; because those classes also exist in
        // THIS app's compiled CSS, they apply and fight the .tiptap stylesheet
        // (old messages at 13px, new ones at 14px). The stylesheet is the single
        // source of truth for presentation, so legacy classes are dropped here.
        // `data-*` (mentions, emoji) and inline `style` (text-align) are kept.
        // The one class we DO need — a code block's `language-*` — is read in the
        // <pre> branch below, which runs on the parent before this strips a child.
        if (node.attribs?.class) delete node.attribs.class

        // Mentions: swap the stored span for an interactive component that
        // resolves the live name, flags self-mentions, and links channels.
        const mentionType = node.attribs?.["data-type"]
        const mentionID = node.attribs?.["data-id"]
        if (mentionID && (mentionType === "userMention" || mentionType === "channelMention")) {
            const fallback = mentionLabel(node)
            return mentionType === "userMention" ? (
                <UserMention id={mentionID} fallback={fallback} />
            ) : (
                <ChannelMention id={mentionID} fallback={fallback} />
            )
        }

        // Spoiler: swap the stored span for a click-to-reveal component (data-spoiler
        // survives the class-strip above, like mentions' data-*).
        if (node.name === "span" && node.attribs?.["data-spoiler"] !== undefined) {
            return <Spoiler>{domToReact(node.children as DOMNode[], options)}</Spoiler>
        }

        // Custom emoji: an inline <img data-type="customEmoji">. Render it sized like an
        // emoji (the author class is stripped above), src-sanitized to a safe scheme.
        if (node.name === "img" && node.attribs?.["data-type"] === "customEmoji") {
            const src = (node.attribs.src ?? "").trim()
            if (!SAFE_IMG_SRC.test(src)) return <></>
            const alt = node.attribs.alt ?? ""
            // `emoji` class → sized by `.tiptap .emoji` (same rule as the composer),
            // which beats `.tiptap img` on specificity. Consistent inline emoji size.
            return <img src={src} alt={alt} title={alt} loading="lazy" className="emoji" />
        }

        // Code blocks: <pre><code class="language-xxx">…</code></pre>. Returning
        // an element stops recursion into the children, so the <code>'s class
        // survives the strip above — read the language + raw text here and hand
        // off to CodeBlock (highlighting + copy).
        if (node.name === "pre") {
            const codeEl = node.children.find(
                (child): child is Element => child instanceof Element && child.name === "code",
            )
            const language = (codeEl?.attribs?.class ?? "").match(/language-(\S+)/)?.[1]
            const code = textContent(codeEl ?? node).replace(/\n$/, "")
            return <CodeBlock code={code} language={language} />
        }

        // Sanitize links: safe scheme only, always open in a new tab.
        if (node.name === "a") {
            const href = (node.attribs?.href ?? "").trim()
            return (
                <a href={SAFE_HREF.test(href) ? href : undefined} target="_blank" rel="noopener noreferrer nofollow">
                    {domToReact(node.children as DOMNode[], options)}
                </a>
            )
        }
    },
}

export const RichTextRenderer = ({ html }: { html: string }) => {
    const tree = useMemo(() => parse(html, options), [html])
    return <div className="tiptap">{tree}</div>
}

export default RichTextRenderer
