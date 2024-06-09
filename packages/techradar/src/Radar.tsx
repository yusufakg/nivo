import { Container, SvgWrapper, useDimensions } from '@nivo/core'
import { Fragment, ReactNode, createElement } from 'react'
import { RadarGrid } from './RadarGrid'
import { useRadar } from './hooks'
import { svgDefaultProps } from './props'
import { RadarLayerId, RadarSvgProps } from './types'

type InnerRadarProps<D extends Record<string, unknown>> = Omit<
    RadarSvgProps<D>,
    'animate' | 'motionConfig' | 'renderWrapper' | 'theme'
>

const InnerRadar = <D extends Record<string, unknown>>({
    data,
    keys,
    indexBy,
    layers = svgDefaultProps.layers,
    rotation: rotationDegrees = svgDefaultProps.rotation,
    margin: partialMargin,
    width,
    height,
    gridLevels = svgDefaultProps.gridLevels,
    gridShape = svgDefaultProps.gridShape,
    gridLabel = svgDefaultProps.gridLabel,
    gridLabelOffset = svgDefaultProps.gridLabelOffset,
    colors = svgDefaultProps.colors,
    role,
    ariaLabel,
    ariaLabelledBy,
    ariaDescribedBy,
    defs = svgDefaultProps.defs,
    fill = svgDefaultProps.fill,
}: InnerRadarProps<D>) => {
    const { margin, innerWidth, innerHeight, outerWidth, outerHeight } = useDimensions(
        width,
        height,
        partialMargin
    )

    const { indices, boundDefs, rotation, radius, centerX, centerY, angleStep, customLayerProps } =
        useRadar<D>({
            data,
            keys,
            indexBy,
            rotationDegrees,
            width: innerWidth,
            height: innerHeight,
            colors,
            defs,
            fill,
        })

    const layerById: Record<RadarLayerId, ReactNode> = {
        grid: null,
    }

    if (layers.includes('grid')) {
        layerById.grid = (
            <g key="grid" transform={`translate(${centerX}, ${centerY})`}>
                <RadarGrid<D>
                    levels={gridLevels}
                    shape={gridShape}
                    radius={radius}
                    rotation={rotation}
                    angleStep={angleStep}
                    indices={indices}
                    label={gridLabel}
                    labelOffset={gridLabelOffset}
                />
            </g>
        )
    }

    return (
        <SvgWrapper
            defs={boundDefs}
            width={outerWidth}
            height={outerHeight}
            margin={margin}
            role={role}
            ariaLabel={ariaLabel}
            ariaLabelledBy={ariaLabelledBy}
            ariaDescribedBy={ariaDescribedBy}
        >
            {layers.map((layer, i) => {
                if (typeof layer === 'function') {
                    return <Fragment key={i}>{createElement(layer, customLayerProps)}</Fragment>
                }

                return layerById?.[layer] ?? null
            })}
        </SvgWrapper>
    )
}

export const Radar = <D extends Record<string, unknown>>({
    animate = svgDefaultProps.animate,
    motionConfig = svgDefaultProps.motionConfig,
    theme,
    renderWrapper,
    ...otherProps
}: RadarSvgProps<D>) => (
    <Container
        {...{
            animate,
            motionConfig,
            renderWrapper,
            theme,
        }}
    >
        <InnerRadar<D> {...otherProps} />
    </Container>
)
