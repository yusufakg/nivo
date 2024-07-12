import { ResponsiveWrapper } from '@nivo/core'
import { Techradar } from './Techradar'
import { RadarSvgProps } from './types'

export const ResponsiveTechradar = <RawDatum,>(
    props: Omit<RadarSvgProps<RawDatum>, 'height' | 'width'>
) => (
    <ResponsiveWrapper>
        {({ width, height }) => <Techradar<RawDatum> width={width} height={height} {...props} />}
    </ResponsiveWrapper>
)
