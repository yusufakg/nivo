import { ResponsiveWrapper } from '@nivo/core'
import { Techradar } from './Techradar'
import { RadarSvgProps } from './types'

export const ResponsiveTechradar = <RawData,>(
    props: Omit<RadarSvgProps<RawData>, 'height' | 'width'>
) => (
    <ResponsiveWrapper>
        {({ width, height }) => <Techradar<RawData> width={width} height={height} {...props} />}
    </ResponsiveWrapper>
)
