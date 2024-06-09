import { OrdinalColorScaleConfig } from '@nivo/colors'
import { Box, Dimensions, MotionProps, PropertyAccessor, SvgDefsAndFill, Theme } from '@nivo/core'
import { AnimatedProps } from '@react-spring/web'
import { ScaleLinear } from 'd3-scale'
import { AriaAttributes, FunctionComponent } from 'react'

export interface RadarDataProps<D extends Record<string, unknown>> {
    data: D[]
    keys: string[]
    indexBy: PropertyAccessor<D, string>
}

export interface GridLabelProps {
    id: string
    anchor: 'start' | 'middle' | 'end'
    angle: number
    x: number
    y: number
    animated: AnimatedProps<{
        transform: string
    }>
}
export type GridLabelComponent = FunctionComponent<GridLabelProps>

export interface RadarCustomLayerProps<D extends Record<string, unknown>> {
    data: D[]
    keys: string[]
    indices: string[] | number[]
    colorByKey: RadarColorMapping
    centerX: number
    centerY: number
    radiusScale: ScaleLinear<number, number>
    angleStep: number
}
export type RadarCustomLayer<D extends Record<string, unknown>> = FunctionComponent<
    RadarCustomLayerProps<D>
>

export type RadarLayerId = 'grid'

export type RadarColorMapping = Record<string, string>

export interface RadarCommonProps<D extends Record<string, unknown>> {
    rotation: number

    layers: (RadarLayerId | RadarCustomLayer<D>)[]

    margin: Box

    gridLevels: number
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
}

export interface RadarSvgFillMatcherDatum<D extends Record<string, unknown>> {
    color: string
    data: RadarDataProps<D>['data']
    key: string
}

export type RadarSvgProps<D extends Record<string, unknown>> = Partial<RadarCommonProps<D>> &
    RadarDataProps<D> &
    Dimensions &
    MotionProps &
    SvgDefsAndFill<RadarSvgFillMatcherDatum<D>>
