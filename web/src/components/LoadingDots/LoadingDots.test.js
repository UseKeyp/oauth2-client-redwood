import { render } from '@redwoodjs/testing/web'

import LoadingDots from './LoadingDots'

describe('LoadingDots', () => {
  it('renders successfully', () => {
    expect(() => {
      render(<LoadingDots />)
    }).not.toThrow()
  })
})
