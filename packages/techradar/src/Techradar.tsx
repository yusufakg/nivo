import { InheritedColorConfig, OrdinalColorScaleConfig } from '@nivo/colors'
import { Container, SvgWrapper, useDimensions } from '@nivo/core'
import { ReactNode, useMemo } from 'react'
import { CircleSvg } from './CircleSvg'
import { Circles } from './Circles'
import { LabelSvg } from './LabelSvg'
import { RadarGrid } from './RadarGrid'
import { useCirclePacking } from './hooks-packing'
import { useRadar } from './hooks-radar'
import { svgDefaultProps } from './props'
import { ComputedDatum, RadarLayerId, RadarSvgProps } from './types'

type InnerTechradarProps<RawData> = Omit<
    RadarSvgProps<RawData>,
    'animate' | 'motionConfig' | 'renderWrapper' | 'theme'
>

const InnerTechradar = <RawData,>({
    sectorData,
    ringData,
    blipData = [],
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
            Omit<ComputedDatum<RawData>, 'color' | 'fill'>
        >,
        childColor: svgDefaultProps.circlePackingProps.childColor as InheritedColorConfig<
            ComputedDatum<RawData>
        >,
        borderColor: svgDefaultProps.circlePackingProps.borderColor as InheritedColorConfig<
            ComputedDatum<RawData>
        >,
        labelTextColor: svgDefaultProps.circlePackingProps.labelTextColor as InheritedColorConfig<
            ComputedDatum<RawData>
        >,
        circleComponent: CircleSvg,
        labelComponent: LabelSvg,
    },
}: InnerTechradarProps<RawData>) => {
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
            radii: Array.from({ length: ringIndices.length }).map((_, i) =>
                i === 0 ? 0 : (radius / (ringIndices.length - 1)) * i
            ),
            angles: Array.from({ length: sectorIndices.length }).map(
                (_, i) => rotation + i * angleStep - Math.PI / 2
            ),
            labelAngles: Array.from({ length: sectorIndices.length }).map(
                (_, i) => rotation + i * angleStep - Math.PI / 2 + angleStep / 2
            ),
        }
    }, [sectorIndices, ringIndices, radius, rotation, angleStep])

    const nodes = useCirclePacking<RawData>({
        ...circlePackingProps,
        data: blipData,
        radii,
        angles,
        centerX,
        centerY,
        ringIndices,
        sectorIndices,
        gridShape,
    })

    // TODO: (suggestion) zooming into a blip and use of d3-hierarchy pack
    // const zoomedNodes = useCirclePackingZoom<RawData>(
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
            <Circles<RawData>
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
    //         <Labels<RawData>
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

export const Techradar = <RawData,>({
    animate = svgDefaultProps.animate,
    motionConfig = svgDefaultProps.motionConfig,
    theme,
    renderWrapper,
    ...otherProps
}: RadarSvgProps<RawData>) => (
    <Container
        {...{
            animate,
            motionConfig,
            renderWrapper,
            theme,
        }}
    >
        <InnerTechradar {...otherProps} />
    </Container>
)
