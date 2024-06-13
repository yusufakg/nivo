import { InheritedColorConfig, OrdinalColorScaleConfig } from '@nivo/colors'
import { Box, Dimensions, MotionProps, PropertyAccessor, Theme } from '@nivo/core'
import { AnimatedProps, Interpolation, SpringValue } from '@react-spring/web'
import { AriaAttributes, FunctionComponent } from 'react'

export interface RadarDataProps {
    sectorData: string[]
    ringData: string[]
}

export type SectorIndex = { index: string; data: string }

export type RingIndex = { index: string; data: string }

export interface GridLabelProps {
    id: string
    name: string
    anchor: 'start' | 'middle' | 'end'
    angle: number
    x: number
    y: number
    animated: AnimatedProps<{
        transform: string
    }>
}
export type GridLabelComponent = FunctionComponent<GridLabelProps>

export interface ComputedDatum<RawDatum> {
    id: string
    // contain own id plus all ancestor ids
    path: string[]
    value: number
    percentage: number
    formattedValue: string
    x: number
    y: number
    radius: number
    color: string
    // defined when using patterns or gradients
    fill?: string
    // contains the raw node's data
    data: RawDatum
    depth: number
    height: number
    parent?: ComputedDatum<RawDatum>
}

export type RadarLayerId = 'grid' | 'circles' | 'labels'

export type RadarColorMapping = Record<string, string>

export type MouseHandler<RawDatum> = (
    datum: ComputedDatum<RawDatum>,
    event: React.MouseEvent
) => void

export type MouseHandlers<RawDatum> = {
    onClick?: MouseHandler<RawDatum>
    onMouseEnter?: MouseHandler<RawDatum>
    onMouseMove?: MouseHandler<RawDatum>
    onMouseLeave?: MouseHandler<RawDatum>
}

export type CircleProps<RawDatum> = {
    node: ComputedDatum<RawDatum>
    style: {
        x: SpringValue<number>
        y: SpringValue<number>
        // using an interpolation to avoid negative values
        radius: Interpolation<number>
        color: SpringValue<string>
        opacity: SpringValue<number>
        borderWidth: number
        borderColor: SpringValue<string>
    }
} & MouseHandlers<RawDatum>

export type CircleComponent<RawDatum> = (props: CircleProps<RawDatum>) => JSX.Element

export interface ComputedLabel<RawDatum> {
    label: string | number
    textColor: string
    node: ComputedDatum<RawDatum>
}

export interface LabelProps<RawDatum> {
    node: ComputedDatum<RawDatum>
    label: string | number
    style: {
        x: SpringValue<number>
        y: SpringValue<number>
        // using an interpolation to avoid negative values
        radius: Interpolation<number>
        textColor: SpringValue<string>
        opacity: SpringValue<number>
    }
}

export type LabelComponent<RawDatum> = (props: LabelProps<RawDatum>) => JSX.Element

export interface CirclePackingCommonProps<RawDatum> {
    blipData: RawDatum
    sector: PropertyAccessor<RawDatum, string>
    ring: PropertyAccessor<RawDatum, string>
    id: PropertyAccessor<RawDatum, string>
    padding: number
    leavesOnly: boolean
    theme?: Theme
    colors: OrdinalColorScaleConfig<Omit<ComputedDatum<RawDatum>, 'color' | 'fill'>>
    colorBy: 'id' | 'depth'
    inheritColorFromParent: boolean
    childColor: InheritedColorConfig<ComputedDatum<RawDatum>>
    borderWidth: number
    borderColor: InheritedColorConfig<ComputedDatum<RawDatum>>
    circleComponent: CircleComponent<RawDatum>
    enableLabels: boolean
    label: PropertyAccessor<ComputedDatum<RawDatum>, string>
    labelsFilter?: (label: ComputedLabel<RawDatum>) => boolean
    labelsSkipRadius: number
    labelTextColor: InheritedColorConfig<ComputedDatum<RawDatum>>
    labelComponent: LabelComponent<RawDatum>
    isInteractive: boolean
    tooltip: (props: ComputedDatum<RawDatum>) => JSX.Element
    zoomedId?: string | null
    animate: boolean
    motionConfig: MotionProps['motionConfig']
}

type CirclePackingProps<RawDatum> = Omit<CirclePackingCommonProps<RawDatum>, 'blipData'> &
    MouseHandlers<RawDatum>

export interface RadarCommonProps<RawDatum> {
    rotation: number
    layers: RadarLayerId[]
    margin: Box
    gridShape: 'circular' | 'linear'
    gridLabel: GridLabelComponent
    gridLabelOffset: number
    theme: Theme
    colors: OrdinalColorScaleConfig<{ key: string; index: number }>
    renderWrapper: boolean
    role: string
    ariaLabel: AriaAttributes['aria-label']
    ariaLabelledBy: AriaAttributes['aria-labelledby']
    ariaDescribedBy: AriaAttributes['aria-describedby']
    blipData: RawDatum
    circlePackingProps: CirclePackingProps<RawDatum>
}

export type RadarSvgProps<RawDatum> = Partial<RadarCommonProps<RawDatum>> &
    RadarDataProps &
    Dimensions &
    MotionProps
