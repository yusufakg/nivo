import { InheritedColorConfig, OrdinalColorScaleConfig } from '@nivo/colors'
import { Box, MotionProps, PropertyAccessor, SvgDefsAndFill, Theme, ValueFormat } from '@nivo/core'
import { Interpolation, SpringValue } from '@react-spring/web'
import * as React from 'react'

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

export type CirclePackingLayerId = 'circles' | 'labels'

export interface CirclePackingCustomLayerProps<RawDatum> {
    nodes: ComputedDatum<RawDatum>[]
}

export type CirclePackingCustomLayer<RawDatum> = React.FC<CirclePackingCustomLayerProps<RawDatum>>

export type CirclePackingLayer<RawDatum> = CirclePackingLayerId | CirclePackingCustomLayer<RawDatum>

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

export interface CirclePackingCommonProps<RawDatum> {
    data: RawDatum
    id: PropertyAccessor<RawDatum, string>
    value: PropertyAccessor<RawDatum, number>
    valueFormat?: ValueFormat<number>
    width: number
    height: number
    margin?: Box
    padding: number
    leavesOnly: boolean
    theme?: Theme
    colors: OrdinalColorScaleConfig<Omit<ComputedDatum<RawDatum>, 'color' | 'fill'>>
    colorBy: 'id' | 'depth'
    inheritColorFromParent: boolean
    // used if `inheritColorFromParent` is `true`
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
    layers: CirclePackingLayer<RawDatum>[]
    isInteractive: boolean
    tooltip: (props: ComputedDatum<RawDatum>) => JSX.Element
    zoomedId?: string | null
    animate: boolean
    motionConfig: MotionProps['motionConfig']
    role: string
    renderWrapper?: boolean
}

export type CirclePackingSvgProps<RawDatum> = CirclePackingCommonProps<RawDatum> &
    MouseHandlers<RawDatum> &
    SvgDefsAndFill<ComputedDatum<RawDatum>>

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
