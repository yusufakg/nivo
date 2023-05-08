import { useEffect, useRef } from 'react'
import { Container, useDimensions, useTheme } from '@nivo/core'
import { renderAxisToCanvas } from '@nivo/axes'
import { useParallelCoordinates } from '../hooks'
import { BaseDatum, ParallelCoordinatesCanvasProps } from '../types'
import { canvasDefaultProps } from '../defaults'

type InnerParallelCoordinatesCanvasProps<D extends BaseDatum> = Omit<
    ParallelCoordinatesCanvasProps<D>,
    'renderWrapper' | 'theme'
>

export const InnerParallelCoordinatesCanvas = <D extends BaseDatum>({
    data,
    layout = canvasDefaultProps.layout,
    variables,
    width,
    height,
    margin: partialMargin,
    curve = canvasDefaultProps.curve,
    colors = canvasDefaultProps.colors,
    lineOpacity = canvasDefaultProps.lineOpacity,
    lineWidth = canvasDefaultProps.lineWidth,
    axesTicksPosition = canvasDefaultProps.axesTicksPosition,
    role = canvasDefaultProps.role,
    ariaLabel,
    ariaLabelledBy,
    ariaDescribedBy,
    pixelRatio = canvasDefaultProps.pixelRatio,
}: InnerParallelCoordinatesCanvasProps<D>) => {
    const canvasEl = useRef<HTMLCanvasElement | null>(null)

    const { margin, innerWidth, innerHeight, outerWidth, outerHeight } = useDimensions(
        width,
        height,
        partialMargin
    )

    const { variablesScale, variablesWithScale, computedData, lineGenerator } =
        useParallelCoordinates<D>({
            width: innerWidth,
            height: innerHeight,
            data,
            variables,
            layout,
            colors,
            curve,
        })

    const theme = useTheme()

    useEffect(() => {
        if (canvasEl.current === null) return

        const ctx = canvasEl.current.getContext('2d')
        if (ctx === null) return

        canvasEl.current.width = outerWidth * pixelRatio
        canvasEl.current.height = outerHeight * pixelRatio

        ctx.scale(pixelRatio, pixelRatio)

        ctx.fillStyle = theme.background
        ctx.fillRect(0, 0, outerWidth, outerHeight)
        ctx.translate(margin.left, margin.top)

        lineGenerator.context(ctx)
        computedData.forEach(datum => {
            ctx.save()
            ctx.globalAlpha = lineOpacity

            ctx.beginPath()
            lineGenerator(datum.points)
            ctx.strokeStyle = datum.color
            ctx.lineWidth = lineWidth
            ctx.stroke()

            ctx.restore()
        })

        variablesWithScale.forEach(variable => {
            renderAxisToCanvas(ctx, {
                axis: layout === 'horizontal' ? 'y' : 'x',
                scale: variable.scale,
                x: layout === 'horizontal' ? variablesScale(variable.id) : 0,
                y: layout === 'horizontal' ? 0 : variablesScale(variable.id),
                length: layout === 'horizontal' ? innerHeight : innerWidth,
                ticksPosition: axesTicksPosition,
                theme,
            })
        })
    }, [
        canvasEl,
        outerWidth,
        outerHeight,
        innerWidth,
        innerHeight,
        margin,
        lineGenerator,
        lineOpacity,
        lineWidth,
        computedData,
        variablesScale,
        variablesWithScale,
        layout,
        axesTicksPosition,
        theme,
        pixelRatio,
    ])

    return (
        <canvas
            ref={canvasEl}
            width={outerWidth * pixelRatio}
            height={outerHeight * pixelRatio}
            style={{
                width: outerWidth,
                height: outerHeight,
            }}
            role={role}
            aria-label={ariaLabel}
            aria-labelledby={ariaLabelledBy}
            aria-describedby={ariaDescribedBy}
        />
    )
}

export const ParallelCoordinatesCanvas = <D extends BaseDatum>({
    theme,
    isInteractive = canvasDefaultProps.isInteractive,
    animate = canvasDefaultProps.animate,
    motionConfig = canvasDefaultProps.motionConfig,
    renderWrapper,
    ...otherProps
}: ParallelCoordinatesCanvasProps<D>) => (
    <Container {...{ isInteractive, animate, motionConfig, theme, renderWrapper }}>
        <InnerParallelCoordinatesCanvas<D> isInteractive={isInteractive} {...otherProps} />
    </Container>
)