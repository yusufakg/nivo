import { InheritedColorConfig, OrdinalColorScaleConfig } from '@nivo/colors'
import { Container, SvgWrapper, useDimensions } from '@nivo/core'
import { ReactNode, useMemo } from 'react'
import { CircleSvg } from './CircleSvg'
import { Circles } from './Circles'
import { LabelSvg } from './LabelSvg'
import { RadarGrid } from './RadarGrid'
import { useCirclePacking, useRadar } from './hooks'
import { svgDefaultProps } from './props'
import { ComputedDatum, RadarLayerId, RadarSvgProps } from './types'

type InnerRadarProps<RawDatum> = Omit<
    RadarSvgProps<RawDatum>,
    'animate' | 'motionConfig' | 'renderWrapper' | 'theme'
>

const InnerRadar = <RawDatum,>({
    sectorData,
    ringData,
    blipData,
    layers = svgDefaultProps.layers,
    rotation: rotationDegrees = svgDefaultProps.rotation,
    margin: partialMargin,
    width,
    height,
    gridShape = svgDefaultProps.gridShape,
    gridLabel = svgDefaultProps.gridLabel,
    gridLabelOffset = svgDefaultProps.gridLabelOffset,
    colors = svgDefaultProps.colors,
    role,
    ariaLabel,
    ariaLabelledBy,
    ariaDescribedBy,
    circlePackingProps = {
        ...svgDefaultProps.circlePackingProps,
        colors: svgDefaultProps.colors as OrdinalColorScaleConfig<
            Omit<ComputedDatum<RawDatum>, 'color' | 'fill'>
        >,
        childColor: svgDefaultProps.circlePackingProps.childColor as InheritedColorConfig<
            ComputedDatum<RawDatum>
        >,
        borderColor: svgDefaultProps.circlePackingProps.borderColor as InheritedColorConfig<
            ComputedDatum<RawDatum>
        >,
        labelTextColor: svgDefaultProps.circlePackingProps.labelTextColor as InheritedColorConfig<
            ComputedDatum<RawDatum>
        >,
        circleComponent: CircleSvg,
        labelComponent: LabelSvg,
    },
}: InnerRadarProps<RawDatum>) => {
    const { margin, innerWidth, innerHeight, outerWidth, outerHeight } = useDimensions(
        width,
        height,
        partialMargin
    )

    const { sectorIndices, ringIndices, rotation, radius, centerX, centerY, angleStep } = useRadar({
        sectorData,
        ringData,
        rotationDegrees,
        width: innerWidth,
        height: innerHeight,
        colors,
    })

    const { radii, angles, labelAngles } = useMemo(() => {
        return {
            radii: Array.from({ length: ringIndices.length })
                .map((_, i) => (radius / ringIndices.length) * (i + 1))
                .reverse(),
            angles: Array.from({ length: sectorIndices.length }).map(
                (_, i) => rotation + i * angleStep - Math.PI / 2
            ),
            labelAngles: Array.from({ length: sectorIndices.length }).map(
                (_, i) => rotation + i * angleStep - Math.PI / 2 + angleStep / 2
            ),
        }
    }, [sectorIndices, ringIndices, radius, rotation, angleStep])

    const nodes = useCirclePacking<RawDatum>({
        ...circlePackingProps,
        data: blipData,
        radii,
        angles,
    })

    // const zoomedNodes = useCirclePackingZoom<RawDatum>(
    //     nodes,
    //     circlePackingProps.zoomedId,
    //     innerWidth,
    //     innerHeight
    // )

    const layerById: Record<RadarLayerId, ReactNode> = {
        grid: null,
        circles: null,
        labels: null,
    }

    if (layers.includes('grid')) {
        layerById.grid = (
            <g key="grid" transform={`translate(${centerX}, ${centerY})`}>
                <RadarGrid
                    shape={gridShape}
                    radius={radius}
                    rotation={rotation}
                    angleStep={angleStep}
                    sectorIndices={sectorIndices}
                    ringIndices={ringIndices}
                    label={gridLabel}
                    labelOffset={gridLabelOffset}
                    radii={radii}
                    angles={angles}
                    labelAngles={labelAngles}
                />
            </g>
        )
    }

    if (layers.includes('circles')) {
        layerById.circles = (
            <Circles<RawDatum>
                key="circles"
                nodes={nodes}
                borderWidth={circlePackingProps.borderWidth}
                borderColor={circlePackingProps.borderColor}
                isInteractive={circlePackingProps.isInteractive}
                // onMouseEnter={circlePackingProps.onMouseEnter}
                // onMouseMove={circlePackingProps.onMouseMove}
                // onMouseLeave={circlePackingProps.onMouseLeave}
                // onClick={circlePackingProps.onClick}
                component={circlePackingProps.circleComponent}
                tooltip={circlePackingProps.tooltip}
            />
        )
    }

    // if (enableLabels && layers.includes('labels')) {
    //     layerById.labels = (
    //         <Labels<RawDatum>
    //             key="labels"
    //             nodes={zoomedNodes}
    //             label={label}
    //             filter={labelsFilter}
    //             skipRadius={labelsSkipRadius}
    //             textColor={labelTextColor}
    //             component={labelComponent}
    //         />
    //     )
    // }

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
            {layers.map(layer => {
                return layerById?.[layer] ?? null
            })}
        </SvgWrapper>
    )
}

export const Radar = <RawDatum,>({
    animate = svgDefaultProps.animate,
    motionConfig = svgDefaultProps.motionConfig,
    theme,
    renderWrapper,
    ...otherProps
}: RadarSvgProps<RawDatum>) => (
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
