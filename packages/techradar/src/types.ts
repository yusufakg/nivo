import { OrdinalColorScaleConfig } from '@nivo/colors'
import { Box, Dimensions, MotionProps, Theme } from '@nivo/core'
import { AnimatedProps } from '@react-spring/web'
import { AriaAttributes, FunctionComponent } from 'react'

export interface RadarDataProps {
    sectorData: string[]
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

export type RadarLayerId = 'grid'

export type RadarColorMapping = Record<string, string>

export interface RadarCommonProps {
    rotation: number

    layers: RadarLayerId[]

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

export type RadarSvgProps = Partial<RadarCommonProps> & RadarDataProps & Dimensions & MotionProps
