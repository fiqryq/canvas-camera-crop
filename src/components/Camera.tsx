import React, { useRef, useCallback, useState, useEffect } from 'react'
import Webcam from 'react-webcam'

interface Props {
    onCapture: (images: string) => void
    userFacing: 'user' | 'environment'
}

const Camera: React.FC<Props> = ({
    onCapture,
    userFacing = 'environment',
}): JSX.Element => {
    const webcamRef = useRef(null)
    const [screenHeight, setScreenHeight] = useState(0)

    useEffect(() => {
        const handleResize = (): void => {
            if (typeof window !== 'undefined') {
                setScreenHeight(window.innerHeight)
            }
        }

        if (typeof window !== 'undefined') {
            handleResize()
            window.addEventListener('resize', handleResize)
        }

        return () => {
            if (typeof window !== 'undefined') {
                window.removeEventListener('resize', handleResize)
            }
        }
    }, [])

    const capture = useCallback(async () => {
        // get raw media from camera stream.
        const imageSrc = webcamRef.current.getScreenshot()

        const image = new Image()
        image.src = imageSrc

        await new Promise((resolve) => {
            image.onload = resolve
        })

        // create canvas for cropping media.
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')

        const outputWidth = 480
        const outputHeight = 360
        canvas.width = outputWidth
        canvas.height = outputHeight

        const cropStartX = Math.max((image.width - 400) / 2, 0)
        const cropStartY = Math.max((image.height - 550) / 2, 0)

        const sourceAspectRatio = 400 / 400

        let destWidth = outputWidth
        let destHeight = outputHeight

        if (outputWidth / outputHeight > sourceAspectRatio) {
            destHeight = outputWidth / sourceAspectRatio
        } else {
            destWidth = outputHeight * sourceAspectRatio
        }

        const destX = (outputWidth - destWidth) / 2
        const destY = (outputHeight - destHeight) / 2

        ctx.drawImage(
            image,
            cropStartX,
            cropStartY,
            400,
            400,
            destX,
            destY,
            destWidth,
            destHeight
        )

        const croppedImageSrc = canvas.toDataURL('image/jpeg')
        onCapture(croppedImageSrc)
    }, [webcamRef, onCapture])

    const videoConstraints = {
        width: 480,
        height: screenHeight,
        facingMode: userFacing,
    }

    const RenderOverlayCamera = (): JSX.Element => {
        return (
            <svg
                width="480"
                height="1000"
                viewBox="0 0 480 1000"
                className="absolute"
                fill="none"
            >
                <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M480 5C480 2.23858 477.761 0 475 0H5C2.23858 0 0 2.23858 0 5V1275C0 1277.76 2.23859 1280 5.00001 1280H475C477.761 1280 480 1277.76 480 1275V5ZM57 426C47.6112 426 40 433.611 40 443V659C40 668.389 47.6112 676 57 676H423C432.389 676 440 668.389 440 659V443C440 433.611 432.389 426 423 426H57Z"
                    fill="black"
                    fill-opacity="0.5"
                />
            </svg>
        )
    }

    return (
        <div className="relative grid h-screen w-full place-items-center overflow-hidden">
            <RenderOverlayCamera />
            {screenHeight > 0 ? (
                <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    videoConstraints={videoConstraints}
                />
            ) : (
                <></>
            )}
            <button
                className="absolute inset-x-0 bottom-14 mx-auto h-20 w-20 rounded-full font-bold text-white "
                onClick={capture}
            >
                <div className='w-[70px] h-[70px] rounded-full bg-white border-2 border-blue-600'>
                </div>
            </button>
        </div>
    )
}

export default Camera
