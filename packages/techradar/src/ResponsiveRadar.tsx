import { ResponsiveWrapper } from '@nivo/core'
import { Radar } from './Radar'
import { RadarSvgProps } from './types'

export const ResponsiveRadar = (
    props: Omit<RadarSvgProps, 'height' | 'width'>
) => (
    <ResponsiveWrapper>
        {({ width, height }) => <Radar width={width} height={height} {...props} />}
    </ResponsiveWrapper>
)
