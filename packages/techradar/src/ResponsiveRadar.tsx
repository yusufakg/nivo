import { ResponsiveWrapper } from '@nivo/core'
import { Radar } from './Radar'
import { RadarSvgProps } from './types'

export const ResponsiveRadar = <D extends Record<string, unknown>>(
    props: Omit<RadarSvgProps<D>, 'height' | 'width'>
) => (
    <ResponsiveWrapper>
        {({ width, height }) => <Radar<D> width={width} height={height} {...props} />}
    </ResponsiveWrapper>
)
