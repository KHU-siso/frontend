"""Extract original icon pixels from Figma 971:733. Requires local Pillow.

Keep icon RGB/alpha unchanged. Suppress disconnected neighboring scraps outside
the icon support; do not erase white fills or flatten transparent lens openings.
Never erase white fills, redraw icons, resize assets or mutate the Figma source.
"""
import json
from collections import deque
from pathlib import Path
from PIL import Image, ImageChops, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
config = json.loads((ROOT / 'scripts/pastel-sheet.json').read_text(encoding='utf-8'))
source = Image.open(ROOT / config['sourceImage']).convert('RGBA')
assert list(source.size) == config['size']
alpha = source.getchannel('A')
result = []


def isolate_icon(im):
    """Select connected opaque artwork plus its original antialiased edge pixels."""
    w, h = im.size
    values = im.getchannel('A').tobytes()
    visited = bytearray(w * h)
    components = []
    for p, value in enumerate(values):
        if value < 128 or visited[p]:
            continue
        queue, component = deque([p]), []
        visited[p] = 1
        while queue:
            q = queue.popleft()
            component.append(q)
            x, y = q % w, q // w
            for yy in range(max(0, y - 1), min(h, y + 2)):
                for xx in range(max(0, x - 1), min(w, x + 2)):
                    j = yy * w + xx
                    if not visited[j] and values[j] >= 128:
                        visited[j] = 1
                        queue.append(j)
        components.append(component)
    threshold = max(8, max(map(len, components)) * 0.005)
    support_bytes = bytearray(w * h)
    for component in components:
        if len(component) >= threshold:
            for p in component:
                support_bytes[p] = 255
    support = Image.frombytes('L', im.size, bytes(support_bytes)).filter(ImageFilter.MaxFilter(5))
    cleaned = im.copy()
    cleaned.putalpha(ImageChops.multiply(im.getchannel('A'), support))
    bounds = support.getbbox()
    return cleaned.crop(bounds), bounds

for row, ((y0, y1), definitions) in enumerate(zip(config['rowBands'], config['rows']), 1):
    band = alpha.crop((0, y0, source.width, y1))
    active = [band.crop((x, 0, x + 1, band.height)).getextrema()[1] >= 128 for x in range(source.width)]
    runs, start = [], None
    for x, value in enumerate(active + [False]):
        if value and start is None:
            start = x
        if not value and start is not None:
            runs.append([start, x])
            start = None
    # A one-pixel fragment next to the blossom must not create an extra sheet cell.
    if row == 3:
        merged = []
        for run in runs:
            if merged and run[0] - merged[-1][1] <= 4:
                merged[-1][1] = run[1]
            else:
                merged.append(run)
        runs = merged
    assert len(runs) == len(definitions), (row, runs)
    cuts = [0] + [(runs[i - 1][1] + runs[i][0]) // 2 for i in range(1, len(runs))] + [source.width]
    for col, definition in enumerate(definitions):
        stem, name, slot = definition[:3]
        alias = definition[3] if len(definition) > 3 else None
        occupied = definition[4] if len(definition) > 4 else None
        cell = (cuts[col], y0, cuts[col + 1], y1)
        bounds = alpha.crop(cell).point(lambda v: 255 if v >= 128 else 0).getbbox()
        assert bounds
        rect = (max(cell[0], cell[0] + bounds[0] - 2), max(y0, y0 + bounds[1] - 2), min(cell[2], cell[0] + bounds[2] + 2), min(y1, y0 + bounds[3] + 2))
        im, trim = isolate_icon(source.crop(rect))
        rect = (rect[0] + trim[0], rect[1] + trim[1], rect[0] + trim[2], rect[1] + trim[3])
        item_id = alias or 'pastel-' + stem
        file = 'pastel/' + item_id + '.png'
        if not alias or alias == 'beige-brim-hat':
            im.save(ROOT / 'src/assets/items' / file)
        ratio = im.width / im.height
        width, top, left = 60.0, 0.0, 0.0
        if slot == 'headwear':
            if row == 3:
                width, top, left = 24.0, 14.0, 52.0
            else:
                bottom = 43.0 if 'earflap' in stem or 'aviator' in stem else 28.5
                width = min(64.0 if bottom == 43 else 60.0, (bottom - 1) * ratio / (1660 / 2448))
                top = bottom - width / ratio * 1660 / 2448
                left = (100 - width) / 2
        elif slot == 'outfit':
            width, top = min(86.0, 43 * ratio / (1660 / 2448)), 35.5
            left = (100 - width) / 2
        elif slot == 'bag':
            width, top, left = 48.0, 46.0, 17.0
        elif slot == 'neckAccessory':
            width = 32.0 if stem == 'red-bow-tie' else 61.0
            top, left = 41.0, (100 - width) / 2
        elif slot == 'faceAccessory':
            width = 46.0
            top, left = 31.6 - width / ratio * 1660 / 2448 / 2, 27.0
        elif slot == 'badge':
            width, top, left = 14.0, 54.0, 62.0
        category = '모자' if slot == 'headwear' and row != 3 else '옷' if slot == 'outfit' else '장식' if slot == 'badge' else '액세서리'
        tags = ['파스텔'] + (['안경'] if slot == 'faceAccessory' else []) + (['장식'] if row == 3 else []) + (['코스튬'] if occupied else [])
        price = {'headwear': 8, 'outfit': 14, 'bag': 9, 'neckAccessory': 6, 'faceAccessory': 8, 'badge': 4}[slot]
        if row == 3:
            price = 4 if slot == 'badge' else 5
        result.append({'id': item_id, 'name': name, 'category': category, 'slot': slot, 'price': price, 'available': True, 'tags': tags, 'sourceNodeId': config['nodeId'], 'sourceIds': [config['nodeId']], 'sourceCell': [row, col + 1], 'sourceRect': [rect[0], rect[1], im.width, im.height], 'aliasOf': alias, 'ratio': round(ratio, 6), 'placement': {'left': round(left, 6), 'top': round(top, 6), 'width': round(width, 6)}, 'layers': [{'id': config['nodeId'], 'file': file, 'x': 0, 'y': 0, 'width': 100}], **({'eyesAbove': True} if slot == 'faceAccessory' and 'sunglasses' not in stem else {}), **({'occupiedSlots': occupied, 'combinationNote': '의상과 장신구가 한 이미지로 그려진 세트입니다. 포함된 가방이나 목도리만 따로 해제할 수 없습니다.'} if occupied else {})})

output = {'fileKey': 'a9SBfEEq9DY4PA857328Zr', 'sourceNodeId': config['nodeId'], 'sourceImage': config['sourceImage'], 'pixelSize': list(source.size), 'extraction': 'Original RGBA icon pixels retained; only disconnected neighboring scraps outside the icon support become transparent. No redraw, recolor, white removal or resizing. Positions are development attachments because the sheet has no posed Ong.', 'items': result}
(ROOT / 'src/data/pastelItems.json').write_text(json.dumps(output, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print({'sourceIcons': len(result), 'newProducts': sum(not i['aliasOf'] for i in result), 'existingAliases': sum(bool(i['aliasOf']) for i in result), 'exportedPNG': sum(not i['aliasOf'] or i['id'] == 'beige-brim-hat' for i in result)})
