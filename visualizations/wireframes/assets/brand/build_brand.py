"""Build the Cash Out Cut/Ace SVG family from shared, font-free geometry."""
from pathlib import Path
from math import radians, sin, cos
ROOT=Path(__file__).parent
GREEN='#16b56b'
SPADE='M34 0C28 12 0 29 0 47C0 67 22 75 32 59L23 84H45L36 59C46 75 68 67 68 47C68 29 40 12 34 0Z'
ACE=SPADE
def ring(cx,cy,outer,inner):
    def point(r,a):
        a=radians(a);return f'{cx+r*cos(a):.3f} {cy+r*sin(a):.3f}'
    return ''.join(f'<path d="M{point(outer,a+4)}A{outer} {outer} 0 0 1 {point(outer,a+41)}L{point(inner,a+41)}A{inner} {inner} 0 0 0 {point(inner,a+4)}Z"/>' for a in range(0,360,45))
def text():
    return f'''<g transform="translate(30 14) skewX(-12)">
<g fill="currentColor">
<path d="M65 0H23L0 23V61L23 84H65V62H30L23 55V29L30 22H65Z"/>
<path transform="translate(148)" d="M64 0H21L0 21V44L20 54H43V63H0V84H46L66 64V41L46 31H23V22H64Z"/>
<path transform="translate(222)" d="M0 0H23V30H46V0H69V84H46V53H23V84H0Z"/>
</g>
<path transform="translate(74)" fill="#07140e" stroke="var(--spade-outline,none)" stroke-width=".8" vector-effect="non-scaling-stroke" d="{ACE}"/>
<g fill="{GREEN}">{ring(354,42,42,25)}
<path transform="translate(405)" d="M0 0H23V59L28 64H41L46 59V0H69V64L49 84H20L0 64Z"/>
<path transform="translate(483)" d="M0 0H76V22H49V84H26V22H0Z"/>
</g></g>'''
def svg(body,box,ink=None):
    style=f':root{{color:{ink};--spade-outline:{"#f1f5ef" if ink == "#f1f5ef" else "none"}}}' if ink else ':root{color:#07140e;--spade-outline:none}@media(prefers-color-scheme:dark){:root{color:#f1f5ef;--spade-outline:#f1f5ef}}'
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{box}" role="img" aria-label="Cash Out"><title>Cash Out — Cut / Ace</title><style>{style}</style>{body}</svg>\n'
for variant,ink in [('',None),('-light','#07140e'),('-dark','#f1f5ef')]:
    (ROOT/f'cash-out-wordmark{variant}.svg').write_text(svg(text(),'0 0 598 112',ink))
symbol=f'<g fill="{GREEN}">{ring(64,64,59,47)}<path transform="translate(42 35) scale(.65)" fill="#07140e" stroke="var(--spade-outline,none)" stroke-width=".8" vector-effect="non-scaling-stroke" d="{SPADE}"/></g>'
for variant,ink in [('',None),('-light','#07140e'),('-dark','#f1f5ef')]:
    (ROOT/f'cash-out-symbol{variant}.svg').write_text(svg(symbol,'0 0 128 128',ink))
