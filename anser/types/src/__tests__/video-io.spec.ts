import { VideoOutput } from '../..'
import { VideoIO, VideoIOType } from '../function/video-io/video-io'

describe ('VideoIO', () => {
	it ('Throws error with invalid format', () => {
		expect(() => {
			const badVideo = new VideoIO('', '', VideoIOType.RTMP, 'UHD', '4:3')
		}).toThrowError()

		expect(() => {
			const badVideo = new VideoIO('', '', VideoIOType.RTMP, '', '4:3')
		}).toThrowError()
	})

	it ('Accepts valid formats', () => {
		expect(() => {
			const goodVideo = new VideoIO('', '', VideoIOType.RTMP, '1080i50', '4:3')
			goodVideo.format = '1920p25'
			goodVideo.format = '720p60'
			goodVideo.format = 'any'
		}).not.toThrowError()
	})

	it ('Throws error with invalid aspect ratio', () => {
		expect(() => {
			const badVideo = new VideoIO('', '', VideoIOType.RTMP, '1080i50', '')
		}).toThrowError()

		expect(() => {
			const badVideo = new VideoIO('', '', VideoIOType.RTMP, '1080i50', 'four by three')
		}).toThrowError()
	})

	it ('Accepts valid aspect ratios', () => {
		expect(() => {
			const goodVideo = new VideoIO('', '', VideoIOType.RTMP, '1080i50', '16:9')
			goodVideo.aspectRatio = '9:16'
			goodVideo.aspectRatio = '1:1'
		}).not.toThrowError()

		expect(() => {
			const badVideo = new VideoIO('', '', VideoIOType.RTMP, '1080i50', '0.775')
		}).not.toThrowError()
	})
})

describe ('VideoOutput', () => {
	it ('Throws error with any format', () => {
		expect(() => {
			const badOutput = new VideoOutput('', '', VideoIOType.RTMP, 'any', '0.775')
		}).toThrowError()
	})

	it ('Throws error with any aspect ratio', () => {
		expect(() => {
			const badOutput = new VideoOutput('', '', VideoIOType.RTMP, '1080i50', 'any')
		}).toThrowError()
	})
})
