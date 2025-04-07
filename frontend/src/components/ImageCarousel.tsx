import { useRef, useState, useCallback, useEffect } from "react"
import { Skin } from "../types/skin"

const imgWidth = 125
const imgHeight = 125

// Should take in array of imgSrcs from the skins
export default function ImageCarousel({ skins }: { skins: Skin[] }) {
  const [activeItem, setActiveItem] = useState(0)

  const carouselRef = useRef<HTMLDivElement | null>(null)

  const scrollItem = () => {
    setActiveItem(prevState => {
      if (skins.length - 1 > prevState) {
        return prevState + 1
      } else {
        return 0
      }
    })
  }

  const autoplay = useCallback(() => setInterval(scrollItem, 2000),[])

  useEffect(() => {
    const play = autoplay()
    return () => clearInterval(play)
  }, [autoplay])

  useEffect(() => {
    carouselRef.current?.scroll({left: imgWidth * activeItem})
  }, [activeItem])

  return (
    <div ref={carouselRef} className="carousel carousel-center rounded-box">
      {
        skins.map((skin, index) => (
          <div key={index} className="carousel-item">
            <div>
              <img
                width={imgWidth}
                height={imgHeight}
                src={skin.imgSrc}
                alt={skin.imgSrc}
              />
            </div>
          </div>
        ))
      }
    </div>
  )
}
