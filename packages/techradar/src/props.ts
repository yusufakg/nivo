import { OrdinalColorScaleConfig } from '@nivo/colors'
import { CirclePackingTooltip } from './CirclePackingTooltip'
import { RadarGridLabel } from './RadarGridLabel'
import { RadarLayerId } from './types'

export const svgDefaultProps = {
    layers: ['grid', 'circles', 'labels'] as RadarLayerId[],

    rotation: 0,

    gridShape: 'circular' as const,
    gridLabelOffset: 16,
    gridLabel: RadarGridLabel,

    colors: { scheme: 'nivo' } as OrdinalColorScaleConfig,

    role: 'img',

    animate: true,
    motionConfig: 'gentle' as const,

    circlePackingProps: {
        id: 'id',
        sector: 'sector',
        ring: 'ring',
        padding: 1,
        leavesOnly: false,
        colorBy: 'depth' as const,
        inheritColorFromParent: false,
        childColor: {
            from: 'color',
            modifiers: [['darker', 0.3]],
        },
        borderWidth: 1,
        borderColor: {
            from: 'color',
            modifiers: [['darker', 0.3]],
        },
        enableLabels: false,
        label: 'id',
        labelTextColor: {
            from: 'color',
            modifiers: [['darker', 1.6]],
        },
        labelsSkipRadius: 8,
        isInteractive: false,
        tooltip: CirclePackingTooltip,
        animate: false,
        motionConfig: 'gentle',
    },
}
