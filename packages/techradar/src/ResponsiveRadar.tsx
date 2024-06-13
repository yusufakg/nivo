import { ResponsiveWrapper } from '@nivo/core'
import { Radar } from './Radar'
import { RadarSvgProps } from './types'

export const ResponsiveRadar = <RawDatum,>(
    props: Omit<RadarSvgProps<RawDatum>, 'height' | 'width'>
) => (
    <ResponsiveWrapper>
        {({ width, height }) => <Radar<RawDatum> width={width} height={height} {...props} />}
    </ResponsiveWrapper>
)
