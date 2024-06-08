import { mount } from 'enzyme'
import { LegendProps, BoxLegendSvg } from '@nivo/legends'
// @ts-ignore
import { Radar, RadarSvgProps } from '../src'

type TestDatum = {
    A: number
    B: number
    category: string
}

const baseProps: RadarSvgProps<TestDatum> = {
    width: 500,
    height: 300,
    data: [
        { A: 10, B: 20, category: 'first' },
        { A: 20, B: 30, category: 'second' },
        { A: 30, B: 10, category: 'third' },
    ],
    keys: ['A', 'B'],
    indexBy: 'category',
    animate: false,
}

const baseLegend: LegendProps = {
    anchor: 'top-left',
    direction: 'column',
    itemWidth: 56,
    itemHeight: 24,
}

it('should render a basic radar chart', () => {
    const wrapper = mount(<Radar<TestDatum> {...baseProps} />)

    const layers = wrapper.find('RadarLayer')
    expect(layers).toHaveLength(2)

    const layer0 = layers.at(0)
    expect(layer0.prop('item')).toBe('A')
    const layer0path = layer0.find('path')
    expect(layer0path.prop('fill')).toBe('rgba(232, 193, 160, 1)')

    const layer1 = layers.at(1)
    expect(layer1.prop('item')).toBe('B')
    const layer1path = layer1.find('path')
    expect(layer1path.prop('fill')).toBe('rgba(244, 117, 96, 1)')
})

describe('layout', () => {
    it('should support global rotation', () => {
        const wrapperA = mount(<Radar<TestDatum> {...baseProps} rotation={90} />)
        const wrapperB = mount(<Radar<TestDatum> {...baseProps} rotation={-90} />)
        // the two first labels in the two components should have the same text content
        const labelA0 = wrapperA.find('RadarGridLabels').at(0)
        const labelB0 = wrapperB.find('RadarGridLabels').at(0)
        // but positions should be opposite each other on the x axis, equal position on y axis
        const getPos = (transformString: string) =>
            transformString.replace('translate(', '').replace(')', '').split(', ')
        const posA0 = getPos(labelA0.find('g').first().prop('transform') as string)
        const posB0 = getPos(labelB0.find('g').first().prop('transform') as string)
        expect(Number(posB0[0])).toBeCloseTo(-Number(posA0[0]), 4)
        expect(Number(posB0[1])).toBeCloseTo(Number(posA0[1]), 4)
    })
})

describe('style', () => {
    it('custom colors array', () => {
        const colors = ['rgba(255, 0, 0, 1)', 'rgba(0, 0, 255, 1)']
        const wrapper = mount(<Radar {...baseProps} colors={colors} />)

        expect(wrapper.find('RadarLayer').at(0).find('path').prop('fill')).toBe(colors[0])
        expect(wrapper.find('RadarLayer').at(1).find('path').prop('fill')).toBe(colors[1])
    })

    it('custom colors function', () => {
        const colorMapping = {
            A: 'rgba(255, 0, 0, 1)',
            B: 'rgba(0, 0, 255, 1)',
        }
        const wrapper = mount(
            <Radar<TestDatum>
                {...baseProps}
                colors={d => colorMapping[d.key as keyof typeof colorMapping]}
            />
        )

        expect(wrapper.find('RadarLayer').at(0).find('path').prop('fill')).toBe(colorMapping.A)
        expect(wrapper.find('RadarLayer').at(1).find('path').prop('fill')).toBe(colorMapping.B)
    })
})

describe('accessibility', () => {
    it('should forward root aria properties to the SVG element', () => {
        const wrapper = mount(
            <Radar<TestDatum>
                {...baseProps}
                ariaLabel="AriaLabel"
                ariaLabelledBy="AriaLabelledBy"
                ariaDescribedBy="AriaDescribedBy"
            />
        )

        const svg = wrapper.find('svg')

        expect(svg.prop('aria-label')).toBe('AriaLabel')
        expect(svg.prop('aria-labelledby')).toBe('AriaLabelledBy')
        expect(svg.prop('aria-describedby')).toBe('AriaDescribedBy')
    })
})

describe('legend', () => {
    it('should show key when legend data is not set', () => {
        const { keys } = baseProps
        const legends = [baseLegend]
        const wrapper = mount(<Radar {...baseProps} legends={legends} />)

        expect(wrapper.find(BoxLegendSvg).find('text').at(0).text()).toBe(keys[0])
        expect(wrapper.find(BoxLegendSvg).find('text').at(1).text()).toBe(keys[1])
    })

    it('show custom legend label when legend data size is 1', () => {
        const { keys } = baseProps
        const customLabels = { A: 'A is good', B: 'B is best' }
        const legends = [
            { ...baseLegend, data: keys.map(key => ({ id: key, label: customLabels[key] })) },
        ]
        const wrapper = mount(<Radar {...baseProps} legends={legends} />)

        expect(wrapper.find(BoxLegendSvg).find('text').at(0).text()).toBe(customLabels.A)
        expect(wrapper.find(BoxLegendSvg).find('text').at(1).text()).toBe(customLabels.B)
    })

    it('show custom legend label when legend data size is 2 over', () => {
        const { keys } = baseProps
        const customLabels = [
            { A: 'A - 0', B: 'B - 0' },
            { A: 'A - 1', B: 'B - 0' },
        ]
        const legends = [
            { ...baseLegend, data: keys.map(key => ({ id: key, label: customLabels[0][key] })) },
            { ...baseLegend, data: keys.map(key => ({ id: key, label: customLabels[1][key] })) },
        ]
        const wrapper = mount(<Radar {...baseProps} legends={legends} />)

        expect(wrapper.find(BoxLegendSvg).find('text').at(0).text()).toBe(customLabels[0].A)
        expect(wrapper.find(BoxLegendSvg).find('text').at(1).text()).toBe(customLabels[0].B)
        expect(wrapper.find(BoxLegendSvg).find('text').at(2).text()).toBe(customLabels[1].A)
        expect(wrapper.find(BoxLegendSvg).find('text').at(3).text()).toBe(customLabels[1].B)
    })
})
