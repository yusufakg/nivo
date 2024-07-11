// TODO: write tests for Techradar, copied over tests from nivo radar

// import { mount } from 'enzyme'
// import React from 'react'
// // @ts-ignore
// import { Radar, RadarSvgProps } from '../src'
// import { sampleData, SampleDatum } from './fixtures'

// type TestDatum = {
//     A: number
//     B: number
//     category: string
// }

// const baseProps: RadarSvgProps<TestDatum> = {
//     width: 500,
//     height: 300,
//     data: [
//         { A: 10, B: 20, category: 'first' },
//         { A: 20, B: 30, category: 'second' },
//         { A: 30, B: 10, category: 'third' },
//     ],
//     animate: false,
// }

// const testCases = [
//     {
//         Chart: Radar,
//         circle: 'CircleSvg',
//         label: 'LabelSvg',
//     },
// ]

// describe('layout', () => {
//     it('should support global rotation', () => {
//         const wrapperA = mount(<Radar<TestDatum> {...baseProps} rotation={90} />)
//         const wrapperB = mount(<Radar<TestDatum> {...baseProps} rotation={-90} />)
//         // the two first labels in the two components should have the same text content
//         const labelA0 = wrapperA.find('RadarGridLabels').at(0)
//         const labelB0 = wrapperB.find('RadarGridLabels').at(0)
//         // but positions should be opposite each other on the x axis, equal position on y axis
//         const getPos = (transformString: string) =>
//             transformString.replace('translate(', '').replace(')', '').split(', ')
//         const posA0 = getPos(labelA0.find('g').first().prop('transform') as string)
//         const posB0 = getPos(labelB0.find('g').first().prop('transform') as string)
//         expect(Number(posB0[0])).toBeCloseTo(-Number(posA0[0]), 4)
//         expect(Number(posB0[1])).toBeCloseTo(Number(posA0[1]), 4)
//     })
// })

// describe('accessibility', () => {
//     it('should forward root aria properties to the SVG element', () => {
//         const wrapper = mount(
//             <Radar<TestDatum>
//                 {...baseProps}
//                 ariaLabel="AriaLabel"
//                 ariaLabelledBy="AriaLabelledBy"
//                 ariaDescribedBy="AriaDescribedBy"
//             />
//         )

//         const svg = wrapper.find('svg')

//         expect(svg.prop('aria-label')).toBe('AriaLabel')
//         expect(svg.prop('aria-labelledby')).toBe('AriaLabelledBy')
//         expect(svg.prop('aria-describedby')).toBe('AriaDescribedBy')
//     })
// })

// testCases.forEach(testCase => {
//     describe(testCase.Chart, () => {
//         describe('circles', () => {
//             it('should render as much circles as items', () => {
//                 const wrapper = mount(
//                     <testCase.Chart<SampleDatum> width={600} height={600} data={sampleData} />
//                 )

//                 expect(wrapper.find(testCase.circle).length).toBe(11)
//             })

//             it(`should only render leaf nodes if 'leavesOnly' is 'true'`, () => {
//                 const wrapper = mount(
//                     <testCase.Chart<SampleDatum>
//                         width={600}
//                         height={600}
//                         data={sampleData}
//                         leavesOnly={true}
//                     />
//                 )

//                 expect(wrapper.find(testCase.circle).length).toBe(7)
//             })

//             it('should support a custom circle component', () => {
//                 const CustomCircle = () => <span />
//                 const wrapper = mount(
//                     <testCase.Chart<SampleDatum>
//                         width={600}
//                         height={600}
//                         data={sampleData}
//                         circleComponent={CustomCircle}
//                     />
//                 )

//                 expect(wrapper.find(CustomCircle).length).toBe(11)
//             })
//         })

//         describe('labels', () => {
//             it(`should render as much labels as nodes if 'enableLabels' is 'true'`, () => {
//                 const wrapper = mount(
//                     <testCase.Chart<SampleDatum>
//                         width={600}
//                         height={600}
//                         data={sampleData}
//                         enableLabels={true}
//                     />
//                 )

//                 expect(wrapper.find(testCase.label).length).toBe(11)
//             })

//             it(`should render no label if 'enableLabels' is 'false'`, () => {
//                 const wrapper = mount(
//                     <testCase.Chart<SampleDatum>
//                         width={600}
//                         height={600}
//                         data={sampleData}
//                         enableLabels={false}
//                     />
//                 )

//                 expect(wrapper.find(testCase.label).length).toBe(0)
//             })

//             it(`should allow to skip labels using 'labelsSkipRadius' if radius is lower than given value`, () => {
//                 const wrapper = mount(
//                     <testCase.Chart<SampleDatum>
//                         width={600}
//                         height={600}
//                         data={sampleData}
//                         enableLabels={true}
//                         labelsSkipRadius={24}
//                     />
//                 )

//                 expect(wrapper.find(testCase.label).length).toBe(10)
//             })

//             it(`should allow to filter labels using a custom filter function`, () => {
//                 const wrapper = mount(
//                     <testCase.Chart<SampleDatum>
//                         width={600}
//                         height={600}
//                         data={sampleData}
//                         enableLabels={true}
//                         labelsFilter={label => label.node.depth === 1}
//                     />
//                 )

//                 expect(wrapper.find(testCase.label).length).toBe(3)
//             })

//             it('should support a custom label component', () => {
//                 const CustomLabel = () => <span />
//                 const wrapper = mount(
//                     <testCase.Chart<SampleDatum>
//                         width={600}
//                         height={600}
//                         data={sampleData}
//                         enableLabels={true}
//                         labelComponent={CustomLabel}
//                     />
//                 )

//                 expect(wrapper.find(CustomLabel).length).toBe(11)
//             })
//         })
//     })
// })
