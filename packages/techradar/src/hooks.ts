import { useOrdinalColorScale } from '@nivo/colors'
import {
    degreesToRadians,
} from '@nivo/core'
import { scaleLinear } from 'd3-scale'
import { useMemo } from 'react'
import { svgDefaultProps } from './props'
import {
    RadarColorMapping,
    RadarCommonProps,
    RadarCustomLayerProps,
    RadarDataProps,
} from './types'

export const useRadar = <D extends Record<string, unknown>>({
    data,
    keys,
    rotationDegrees,
    width,
    height,
    colors = svgDefaultProps.colors,
}: {
    data: RadarDataProps<D>['data']
    keys: RadarDataProps<D>['keys']
    rotationDegrees: RadarCommonProps<D>['rotation']
    width: number
    height: number
    colors: RadarCommonProps<D>['colors']
}) => {
    const indices = useMemo(() => data.map((_, i) => i.toString()), [data])
    const rotation = degreesToRadians(rotationDegrees)

    const getColor = useOrdinalColorScale<{ key: string; index: number }>(colors, 'key')
    const colorByKey: RadarColorMapping = useMemo(
        () =>
            keys.reduce<RadarColorMapping>((mapping, key, index) => {
                mapping[key] = getColor({ key, index })
                return mapping
            }, {}),
        [keys, getColor]
    )

    const { radius, radiusScale, centerX, centerY, angleStep } = useMemo(() => {
        const radius = Math.min(width, height) / 2
        const radiusScale = scaleLinear<number, number>().range([0, radius])

        return {
            radius,
            radiusScale,
            centerX: width / 2,
            centerY: height / 2,
            angleStep: (Math.PI * 2) / data.length,
        }
    }, [keys, data, width, height])

    const customLayerProps: RadarCustomLayerProps<D> = useMemo(
        () => ({
            data,
            keys,
            indices,
            colorByKey,
            centerX,
            centerY,
            radiusScale,
            angleStep,
        }),
        [data, keys, indices, colorByKey, centerX, centerY, radiusScale, angleStep]
    )

    return {
        indices,
        colorByKey,
        rotation,
        radius,
        radiusScale,
        centerX,
        centerY,
        angleStep,
        customLayerProps,
    }
}
