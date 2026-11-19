import { useEffect, useMemo, useState } from 'react'
import { ArrowUpRight, Heart, Minus, Plus, Search, X } from 'lucide-react'
import RunwayLookbook from '@/components/ui/runway-lookbook'
import type { RunwayLook, RunwayProduct } from '@/components/ui/runway-lookbook'
import './dress-collection.css'

type CollectionPiece = RunwayProduct & {
  id: string
  lookIndex: number
  category: 'Dresses' | 'Separates' | 'Finishing pieces'
}

const outfits = [
  { src: '/looks/look-01.webp', alt: 'Red draped crepe gown with a high slit', name: 'Draped in red', category: 'Dresses' },
  { src: '/looks/look-02.webp', alt: 'Olive sculpted peplum dress', name: 'Sculpted olive', category: 'Dresses' },
  { src: '/looks/look-03.webp', alt: 'Black strapless jersey maxi dress', name: 'The black column', category: 'Dresses' },
  { src: '/looks/look-04.webp', alt: 'Blush knit over wide denim', name: 'Soft structure', category: 'Separates' },
  { src: '/looks/look-05.webp', alt: 'Red puff-sleeve belted mini dress', name: 'A little drama', category: 'Dresses' },
  { src: '/looks/look-06.webp', alt: 'Marbled print mesh gown', name: 'Marbled after dark', category: 'Dresses' },
] as const

const pieces: CollectionPiece[] = [
  { id: 'crepe-column-gown', lookIndex: 0, category: 'Dresses', name: 'Draped Crepe Column Gown', price: '$3,450', crop: { top: 0, bottom: 0.62 } },
  { id: 'crepe-train', lookIndex: 0, category: 'Finishing pieces', name: 'Draped Crepe Train', price: '$1,120', crop: { top: 0.48, bottom: 1 } },
  { id: 'sculpted-peplum', lookIndex: 1, category: 'Dresses', name: 'Sculpted Peplum Midi Dress', price: '$2,180', crop: { top: 0, bottom: 0.7 } },
  { id: 'ankle-wrap-sandal', lookIndex: 1, category: 'Finishing pieces', name: 'Ankle-Wrap Leather Sandal', price: '$740', crop: { top: 0.48, bottom: 1 } },
  { id: 'strapless-jersey', lookIndex: 2, category: 'Dresses', name: 'Strapless Jersey Maxi', price: '$1,290', crop: { top: 0, bottom: 0.62 } },
  { id: 'fine-strap-sandal', lookIndex: 2, category: 'Finishing pieces', name: 'Fine-Strap Sandal', price: '$620', crop: { top: 0.48, bottom: 1 } },
  { id: 'cotton-overshirt', lookIndex: 3, category: 'Separates', name: 'Draped Cotton Overshirt', price: '$480', crop: { top: 0, bottom: 0.5 } },
  { id: 'wide-rigid-denim', lookIndex: 3, category: 'Separates', name: 'Wide Rigid Denim', price: '$390', crop: { top: 0.48, bottom: 1 } },
  { id: 'puff-sleeve-mini', lookIndex: 4, category: 'Dresses', name: 'Puff-Sleeve Belted Mini', price: '$1,650', crop: { top: 0, bottom: 0.6 } },
  { id: 'leather-pump', lookIndex: 4, category: 'Finishing pieces', name: 'Platform Leather Pump', price: '$710', crop: { top: 0.48, bottom: 1 } },
  { id: 'marbled-mesh-gown', lookIndex: 5, category: 'Dresses', name: 'Marbled Mesh Gown', price: '$1,980', crop: { top: 0, bottom: 0.6 } },
  { id: 'marbled-mesh-skirt', lookIndex: 5, category: 'Finishing pieces', name: 'Marbled Mesh Skirt', price: '$860', crop: { top: 0.48, bottom: 1 } },
]

const looks: RunwayLook[] = outfits.map((outfit, lookIndex) => ({
  src: outfit.src,
  alt: outfit.alt,
  products: pieces.filter((piece) => piece.lookIndex === lookIndex),
}))

type BagItem = { pieceId: string; quantity: number }
type Panel = 'search' | 'wishlist' | 'bag' | null

function priceValue(price: string) {
  return Number(price.replace(/[^\d]/g, ''))
}

function money(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value)
}

export default function DressCollection() {
  const [bag, setBag] = useState<BagItem[]>([])
  const [saved, setSaved] = useState<string[]>([])
  const [panel, setPanel] = useState<Panel>(null)
  const [query, setQuery] = useState('')
  const [notice, setNotice] = useState('')

  const bagCount = bag.reduce((total, item) => total + item.quantity, 0)
  const bagTotal = bag.reduce((total, item) => {
    const piece = pieces.find((candidate) => candidate.id === item.pieceId)
    return total + (piece ? priceValue(piece.price) * item.quantity : 0)
  }, 0)
  const results = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return normalizedQuery
      ? pieces.filter((piece) => piece.name.toLowerCase().includes(normalizedQuery))
      : pieces
  }, [query])
  const savedPieces = pieces.filter((piece) => saved.includes(piece.id))

  useEffect(() => {
    if (!notice) return
    const timeout = window.setTimeout(() => setNotice(''), 2600)
    return () => window.clearTimeout(timeout)
  }, [notice])

  useEffect(() => {
    if (!panel) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setPanel(null)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [panel])

  const addToBag = (piece: CollectionPiece) => {
    setBag((current) => {
      const existing = current.find((item) => item.pieceId === piece.id)
      return existing
        ? current.map((item) => item.pieceId === piece.id ? { ...item, quantity: item.quantity + 1 } : item)
        : [...current, { pieceId: piece.id, quantity: 1 }]
    })
    setNotice(`${piece.name} added to your bag`)
  }

  const addLookToBag = (lookIndex: number) => {
    const piece = pieces.find((item) => item.lookIndex === lookIndex && item.category !== 'Finishing pieces')
    if (piece) addToBag(piece)
  }

  const addRunwayProduct = (product: RunwayProduct, lookIndex: number) => {
    const piece = pieces.find((item) => item.lookIndex === lookIndex && item.name === product.name)
    if (piece) addToBag(piece)
  }

  const toggleSaved = (pieceId: string) => {
    const piece = pieces.find((item) => item.id === pieceId)
    setSaved((current) => current.includes(pieceId)
      ? current.filter((id) => id !== pieceId)
      : [...current, pieceId])
    if (piece) setNotice(saved.includes(pieceId) ? `${piece.name} removed from your wishlist` : `${piece.name} saved to your wishlist`)
  }

  const changeQuantity = (pieceId: string, delta: number) => {
    setBag((current) => current
      .map((item) => item.pieceId === pieceId ? { ...item, quantity: item.quantity + delta } : item)
      .filter((item) => item.quantity > 0))
  }

  const openPanel = (kind: 'search' | 'wishlist' | 'cart') => {
    setQuery('')
    setPanel(kind === 'cart' ? 'bag' : kind)
  }

  const catalogGroups = [
    { id: 'collection-dresses', name: 'Dresses', items: outfits.map((outfit, index) => ({ outfit, index })).filter(({ outfit }) => outfit.category === 'Dresses') },
    { id: 'collection-separates', name: 'Separates', items: outfits.map((outfit, index) => ({ outfit, index })).filter(({ outfit }) => outfit.category === 'Separates') },
  ]

  return (
    <main className="atelier-site">
      <div id="runway">
        <RunwayLookbook
          looks={looks}
          brand="MAISON HALDEN"
          tabs={[{ label: 'Runway', href: '#runway' }, { label: 'Collection', href: '#collection' }, { label: 'The house', href: '#atelier' }]}
          activeTab={0}
          nav={[{ label: 'All looks', href: '#runway' }, { label: 'Dresses', href: '#collection-dresses' }, { label: 'Separates', href: '#collection-separates' }]}
          activeNav={0}
          title="Spring Summer 2026"
          blurb="Cut close and finished by hand. Six looks move from sculpted daywear to evening pieces made to stay in motion."
          firstNumber={21}
          ctaLabel="Shop this look"
          onShopLook={addLookToBag}
          onAddProduct={addRunwayProduct}
          cartCount={bagCount}
          hideLogin
          loop={false}
          fontSrc={null}
          onNavigate={(target) => {
            if (target.kind === 'search' || target.kind === 'wishlist' || target.kind === 'cart') openPanel(target.kind)
          }}
          ariaLabel="Spring Summer 2026 runway lookbook"
        />
      </div>

      <section className="atelier-collection" id="collection">
        <div className="atelier-section-heading">
          <div>
            <p className="atelier-eyebrow">MAISON HALDEN / SPRING SUMMER 2026</p>
            <h1>The collection, <em>in full.</em></h1>
          </div>
          <p>Explore the pieces from the runway, look by look. Each silhouette is shown with its companion pieces.</p>
        </div>
        {catalogGroups.map((group) => (
          <section className="atelier-group" id={group.id} key={group.id}>
            <div className="atelier-group-heading">
              <h2>{group.name}</h2>
              <span>{String(group.items.length).padStart(2, '0')} LOOKS</span>
            </div>
            <div className="atelier-look-grid">
              {group.items.map(({ outfit, index }) => {
                const lookPieces = pieces.filter((piece) => piece.lookIndex === index)
                return (
                  <article className="atelier-look-card" key={outfit.src}>
                    <div className="atelier-look-image">
                      <img src={outfit.src} alt={outfit.alt} loading="lazy" />
                      <span className="atelier-look-number">LOOK {String(21 + index).padStart(2, '0')}</span>
                    </div>
                    <div className="atelier-look-title">
                      <h3>{outfit.name}</h3>
                      <span>{outfit.category}</span>
                    </div>
                    <ul className="atelier-piece-list">
                      {lookPieces.map((piece) => (
                        <li key={piece.id}>
                          <div>
                            <span>{piece.name}</span>
                            <small>{piece.price}</small>
                          </div>
                          <button
                            type="button"
                            className={`atelier-icon-button${saved.includes(piece.id) ? ' is-saved' : ''}`}
                            aria-label={`${saved.includes(piece.id) ? 'Remove' : 'Add'} ${piece.name} ${saved.includes(piece.id) ? 'from' : 'to'} wishlist`}
                            aria-pressed={saved.includes(piece.id)}
                            onClick={() => toggleSaved(piece.id)}
                          >
                            <Heart size={16} aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            className="atelier-add-button"
                            aria-label={`Add ${piece.name} to bag`}
                            onClick={() => addToBag(piece)}
                          >
                            <Plus size={15} aria-hidden="true" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </article>
                )
              })}
            </div>
          </section>
        ))}
        <div className="atelier-collection-end" id="collection-details">
          <span>12 PIECES</span>
          <p>Garments and finishing pieces from the Spring Summer 2026 lookbook.</p>
        </div>
      </section>

      <footer className="atelier-footer" id="atelier">
        <a className="atelier-footer-brand" href="#runway">MAISON HALDEN<span>®</span></a>
        <p>Made for movement. Kept for a long time.</p>
        <a className="atelier-back-to-top" href="#runway">Back to runway <ArrowUpRight size={14} /></a>
        <div className="atelier-footer-bottom">
          <span>Spring Summer 2026</span>
          <span>Collection lookbook</span>
        </div>
      </footer>

      {panel && (
        <div className="atelier-backdrop" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setPanel(null)
        }}>
          <section className="atelier-panel" role="dialog" aria-modal="true" aria-labelledby="atelier-panel-title">
            <header className="atelier-panel-header">
              <div>
                <p className="atelier-eyebrow">{panel === 'bag' ? 'YOUR SELECTION' : panel === 'wishlist' ? 'SAVED PIECES' : 'FIND A PIECE'}</p>
                <h2 id="atelier-panel-title">{panel === 'bag' ? 'Your bag' : panel === 'wishlist' ? 'Your wishlist' : 'Search the collection'}</h2>
              </div>
              <button type="button" className="atelier-icon-button" onClick={() => setPanel(null)} aria-label="Close panel"><X size={18} /></button>
            </header>
            {panel === 'search' && (
              <label className="atelier-search">
                <Search size={16} aria-hidden="true" />
                <input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search dresses and pieces" />
              </label>
            )}
            {panel === 'search' && <PieceList items={results} onAdd={addToBag} />}
            {panel === 'wishlist' && (
              savedPieces.length
                ? <PieceList items={savedPieces} onAdd={addToBag} />
                : <p className="atelier-empty">Your wishlist is empty. Save a piece from the collection to keep it here.</p>
            )}
            {panel === 'bag' && (
              bag.length
                ? <>
                    <ul className="atelier-bag-list">
                      {bag.map((item) => {
                        const piece = pieces.find((candidate) => candidate.id === item.pieceId)
                        if (!piece) return null
                        return (
                          <li key={item.pieceId}>
                            <img src={outfits[piece.lookIndex].src} alt="" />
                            <div className="atelier-bag-item">
                              <span>{piece.name}</span>
                              <small>{piece.price}</small>
                              <div className="atelier-quantity">
                                <button type="button" onClick={() => changeQuantity(piece.id, -1)} aria-label={`Remove one ${piece.name}`}><Minus size={13} /></button>
                                <span>{item.quantity}</span>
                                <button type="button" onClick={() => changeQuantity(piece.id, 1)} aria-label={`Add one ${piece.name}`}><Plus size={13} /></button>
                              </div>
                            </div>
                          </li>
                        )
                      })}
                    </ul>
                    <div className="atelier-bag-total"><span>Subtotal</span><strong>{money(bagTotal)}</strong></div>
                    <p className="atelier-preview-note">Checkout is not connected in this lookbook preview.</p>
                  </>
                : <p className="atelier-empty">Your bag is empty. Add a piece from the collection to begin.</p>
            )}
          </section>
        </div>
      )}

      {notice && <p className="atelier-toast" role="status">{notice}</p>}

    </main>
  )
}

function PieceList({ items, onAdd }: { items: CollectionPiece[]; onAdd: (piece: CollectionPiece) => void }) {
  if (!items.length) return <p className="atelier-empty">No pieces match that search.</p>
  return (
    <ul className="atelier-piece-results">
      {items.map((piece) => (
        <li key={piece.id}>
          <img src={outfits[piece.lookIndex].src} alt="" />
          <div><span>{piece.name}</span><small>{piece.price}</small></div>
          <button type="button" className="atelier-add-button" onClick={() => onAdd(piece)} aria-label={`Add ${piece.name} to bag`}>
            <Plus size={15} aria-hidden="true" />
          </button>
        </li>
      ))}
    </ul>
  )
}
