export default function ItemArtwork({ item, className = '', layerIndex, ratio = item.ratio }) {
  return <div className={`item-artwork ${className}`} data-item-art={item.id} style={{ aspectRatio: ratio, '--art-ratio': ratio }} aria-hidden="true">{item.layers.map((layer, i) => (layerIndex === undefined ? !layer.wearableOnly : i === layerIndex) && <img key={i} src={layer.src} alt="" decoding="async" data-figma-layer={layer.id} style={{ left: `${layer.x}%`, top: `${layer.y}%`, width: `${layer.width}%`, transform: layer.rotate ? `rotate(${layer.rotate}deg)` : undefined }} />)}</div>
}
