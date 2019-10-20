import { VideoIO, VideoIOType } from '../function/description'

describe ('VideoIO', () => {
	it ('Throws error with invalid format', () => {
		expect(() => {
			const badVideo = new VideoIO('', '', VideoIOType.RTMP)
			badVideo.format = 'UHD'
		}).toThrowError()
	})

	it ('Accepts valid formats', () => {
		expect(() => {
			const goodVideo = new VideoIO('', '', VideoIOType.RTMP)
			goodVideo.format = '1080i50'
		}).not.toThrowError()
	})
})
