import { OrdinalColorScaleConfig } from '@nivo/colors'
import { CirclePackingTooltip } from '../CirclePackingTooltip'
import { CirclePackingLayerId } from './types'

export const defaultProps = {
    id: 'id',
    value: 'value',
    padding: 0,
    leavesOnly: false,
    layers: ['circles', 'labels'] as CirclePackingLayerId[],
    colors: { scheme: 'nivo' } as OrdinalColorScaleConfig,
    colorBy: 'depth' as const,
    inheritColorFromParent: false,
    childColor: {
        from: 'color',
        modifiers: [['darker', 0.3]],
    },
    borderWidth: 0,
    borderColor: {
        from: 'color',
        modifiers: [['darker', 0.3]],
    },
    defs: [],
    fill: [],
    enableLabels: false,
    label: 'id',
    labelTextColor: {
        from: 'color',
        modifiers: [['darker', 1.6]],
    },
    labelsSkipRadius: 8,
    isInteractive: true,
    tooltip: CirclePackingTooltip,
    animate: true,
    motionConfig: 'gentle',
    role: 'img',
    pixelRatio: typeof window !== 'undefined' ? window.devicePixelRatio ?? 1 : 1,
}
