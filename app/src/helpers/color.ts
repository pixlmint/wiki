import {HSL, RGB} from "@/src/contracts/Color";
import Color from 'colorjs.io';

export function generatePleasingColor(): string {
    // Generate a random hue from 0 to 360 degrees
    const hue = Math.floor(Math.random() * 360);

    // Set saturation and lightness to ranges that are generally pleasing
    // Saturation from 60% to 100% (vibrant but not overwhelming)
    const saturation = Math.round(60 + Math.random() * 40);

    // Lightness from 50% to 60% (bright enough to be lively, but not too light)
    const lightness = Math.round(50 + Math.random() * 10);

    const hsl = {
        h: hue,
        s: saturation,
        l: lightness,
    }

    return hslToHex(hsl);
}

export function hslToHex(color: HSL): string {
    let h = color.h;
    let s = color.s;
    let l = color.l;
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = function (n: any) {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color).toString(16).padStart(2, '0');   // convert to Hex and prefix "0" if needed
    };
    return `#${f(0)}${f(8)}${f(4)}`;
}

export function hexToHsl(color: string): HSL {
    const hex = new Color(color);
    const hsl = hex.to('hsl');
    return {
        h: Math.round(hsl.h),
        s: Math.round(hsl.s),
        l: Math.round(hsl.l),
    }
}

export function randomizeColor(input: string): string {
    const hsl = hexToHsl(input);
    const newH = Math.floor(Math.random() * 360); // Randomize hue
    return hslToHex({h: newH, s: hsl.s, l: hsl.l});
}
