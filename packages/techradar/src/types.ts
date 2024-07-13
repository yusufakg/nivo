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

export interface ComputedDatum<RawData> {
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
    data: RawData
    depth: number
    height: number
    parent?: ComputedDatum<RawData>
}

export type RadarLayerId = 'grid' | 'circles' | 'labels'

export type RadarColorMapping = Record<string, string>

export type MouseHandler<RawData> = (datum: ComputedDatum<RawData>, event: React.MouseEvent) => void

export type MouseHandlers<RawData> = {
    onClick?: MouseHandler<RawData>
    onMouseEnter?: MouseHandler<RawData>
    onMouseMove?: MouseHandler<RawData>
    onMouseLeave?: MouseHandler<RawData>
}

export type CircleProps<RawData> = {
    node: ComputedDatum<RawData>
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
} & MouseHandlers<RawData>

export type CircleComponent<RawData> = (props: CircleProps<RawData>) => JSX.Element

export interface ComputedLabel<RawData> {
    label: string | number
    textColor: string
    node: ComputedDatum<RawData>
}

export interface LabelProps<RawData> {
    node: ComputedDatum<RawData>
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

export type LabelComponent<RawData> = (props: LabelProps<RawData>) => JSX.Element

export interface CirclePackingCommonProps<RawData> {
    blipData: RawData[]
    sector: PropertyAccessor<RawData, string>
    ring: PropertyAccessor<RawData, string>
    id: PropertyAccessor<RawData, string>
    padding: number
    leavesOnly: boolean
    theme?: Theme
    colors: OrdinalColorScaleConfig<Omit<ComputedDatum<RawData>, 'color' | 'fill'>>
    colorBy: 'id' | 'depth'
    inheritColorFromParent: boolean
    childColor: InheritedColorConfig<ComputedDatum<RawData>>
    borderWidth: number
    borderColor: InheritedColorConfig<ComputedDatum<RawData>>
    circleComponent: CircleComponent<RawData>
    enableLabels: boolean
    label: PropertyAccessor<ComputedDatum<RawData>, string>
    labelsFilter?: (label: ComputedLabel<RawData>) => boolean
    labelsSkipRadius: number
    labelTextColor: InheritedColorConfig<ComputedDatum<RawData>>
    labelComponent: LabelComponent<RawData>
    isInteractive: boolean
    tooltip: (props: ComputedDatum<RawData>) => JSX.Element
    zoomedId?: string | null
    animate: boolean
    motionConfig: MotionProps['motionConfig']
}

type CirclePackingProps<RawData> = Omit<CirclePackingCommonProps<RawData>, 'blipData'> &
    MouseHandlers<RawData>

export interface RadarCommonProps<RawData> {
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
    blipData: RawData[]
    circlePackingProps: CirclePackingProps<RawData>
}

export type RadarSvgProps<RawData> = Partial<RadarCommonProps<RawData>> &
    RadarDataProps &
    Dimensions &
    MotionProps
