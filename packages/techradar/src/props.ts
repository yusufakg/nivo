import { RadarGridLabel } from './RadarGridLabel'
import { RadarLayerId } from './types'

export const svgDefaultProps = {
    layers: ['grid'] as RadarLayerId[],

    rotation: 0,

    gridLevels: 3,
    gridShape: 'circular' as const,
    gridLabelOffset: 16,
    gridLabel: RadarGridLabel,

    colors: { scheme: 'nivo' as const },

    role: 'img',

    animate: true,
    motionConfig: 'gentle' as const,

    defs: [],
    fill: [],
}
