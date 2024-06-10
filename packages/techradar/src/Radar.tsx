import { Container, SvgWrapper, useDimensions } from '@nivo/core'
import { ReactNode } from 'react'
import { RadarGrid } from './RadarGrid'
import { useRadar } from './hooks'
import { svgDefaultProps } from './props'
import { RadarLayerId, RadarSvgProps } from './types'

type InnerRadarProps = Omit<
    RadarSvgProps,
    'animate' | 'motionConfig' | 'renderWrapper' | 'theme'
>

const InnerRadar = ({
    sectorData,
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
}: InnerRadarProps) => {
    const { margin, innerWidth, innerHeight, outerWidth, outerHeight } = useDimensions(
        width,
        height,
        partialMargin
    )

    const { indices, rotation, radius, centerX, centerY, angleStep } =
        useRadar({
            sectorData,
            rotationDegrees,
            width: innerWidth,
            height: innerHeight,
            colors,
        })

    const layerById: Record<RadarLayerId, ReactNode> = {
        grid: null,
    }

    if (layers.includes('grid')) {
        layerById.grid = (
            <g key="grid" transform={`translate(${centerX}, ${centerY})`}>
                <RadarGrid
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
            width={outerWidth}
            height={outerHeight}
            margin={margin}
            role={role}
            ariaLabel={ariaLabel}
            ariaLabelledBy={ariaLabelledBy}
            ariaDescribedBy={ariaDescribedBy}
        >
            {layers.map((layer) => {
                return layerById?.[layer] ?? null
            })}
        </SvgWrapper>
    )
}

export const Radar = ({
    animate = svgDefaultProps.animate,
    motionConfig = svgDefaultProps.motionConfig,
    theme,
    renderWrapper,
    ...otherProps
}: RadarSvgProps) => (
    <Container
        {...{
            animate,
            motionConfig,
            renderWrapper,
            theme,
        }}
    >
        <InnerRadar {...otherProps} />
    </Container>
)
