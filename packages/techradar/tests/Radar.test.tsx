import { mount } from 'enzyme'
import React from 'react'
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
    animate: false,
}

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
