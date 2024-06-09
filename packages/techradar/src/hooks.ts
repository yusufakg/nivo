import { useOrdinalColorScale } from '@nivo/colors'
import {
    // @ts-ignore
    bindDefs,
    degreesToRadians,
    usePropertyAccessor,
} from '@nivo/core'
import { scaleLinear } from 'd3-scale'
import { useMemo } from 'react'
import { svgDefaultProps } from './props'
import {
    RadarColorMapping,
    RadarCommonProps,
    RadarCustomLayerProps,
    RadarDataProps,
    RadarSvgProps,
} from './types'

export const useRadar = <D extends Record<string, unknown>>({
    data,
    keys,
    indexBy,
    rotationDegrees,
    width,
    height,
    colors = svgDefaultProps.colors,
    defs,
    fill,
}: {
    data: RadarDataProps<D>['data']
    keys: RadarDataProps<D>['keys']
    indexBy: RadarDataProps<D>['indexBy']
    rotationDegrees: RadarCommonProps<D>['rotation']
    width: number
    height: number
    colors: RadarCommonProps<D>['colors']
    defs: RadarSvgProps<D>['defs']
    fill: RadarSvgProps<D>['fill']
}) => {
    const getIndex = usePropertyAccessor<D, string>(indexBy)
    const indices = useMemo(() => data.map(getIndex), [data, getIndex])
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

    const { boundDefs, fillByKey } = useMemo(() => {
        // expand keys into structure expected by bindDefs
        const keyData = keys.map(k => ({ key: k, color: colorByKey[k], data, fill: null }))
        const boundDefs = bindDefs(defs, keyData, fill)
        const fillByKey = keyData.reduce<Record<string, string | null>>((mapping, keyDatum) => {
            const { key: keyName, fill } = keyDatum
            mapping[keyName] = fill
            return mapping
        }, {})

        return { boundDefs, fillByKey }
    }, [keys, data, defs, fill, colorByKey])

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
        getIndex,
        indices,
        colorByKey,
        fillByKey,
        boundDefs,
        rotation,
        radius,
        radiusScale,
        centerX,
        centerY,
        angleStep,
        customLayerProps,
    }
}
