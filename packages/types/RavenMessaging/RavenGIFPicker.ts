interface TenorResultObject {
    results: Result[];
    next: string;
}
interface Result {
    id: string;
    title: string;
    media_formats: Mediaformats;
    created: number;
    content_description: string;
    itemurl: string;
    url: string;
    tags: string[];
    flags: any[];
    hasaudio: boolean;
}
interface Mediaformats {
    GIFFormatObject: GIFFormatObject;
    mediumgif: GIFFormatObject;
    tinywebp_transparent?: GIFFormatObject;
    tinywebm: GIFFormatObject;
    gif: GIFFormatObject;
    tinygif: GIFFormatObject;
    mp4: GIFFormatObject;
    nanomp4: GIFFormatObject;
    gifpreview: GIFFormatObject;
    webm: GIFFormatObject;
    nanowebp_transparent?: GIFFormatObject;
    nanowebm: GIFFormatObject;
    loopedmp4: GIFFormatObject;
    tinygifpreview: GIFFormatObject;
    nanowebppreview_transparent?: GIFFormatObject;
    tinymp4: GIFFormatObject;
    nanogif: GIFFormatObject;
    webp_transparent?: GIFFormatObject;
    webppreview_transparent?: GIFFormatObject;
    tinywebppreview_transparent?: GIFFormatObject;
    tinygif_transparent?: GIFFormatObject;
    gif_transparent?: GIFFormatObject;
    nanogif_transparent?: GIFFormatObject;
}
interface GIFFormatObject {
    url: string;
    duration: number;
    preview: string;
    dims: number[];
    size: number;
}