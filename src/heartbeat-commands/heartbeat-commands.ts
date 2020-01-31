export const enum HeartbeatCommandType {
	SendSystemInfo = 'SEND_SYSTEM_INFO',
	SendCaptureDevices = 'SEND_CAPTURE_DEVICES',
	CheckJobCanRun = 'CHECK_JOB_CAN_RUN'
}

export interface HeartbeatCommandBase {
	type: HeartbeatCommandType
}

export interface HeartbeatCommandSendSystemInfo extends HeartbeatCommandBase {
	type: HeartbeatCommandType.SendSystemInfo
}

export interface HeartbeatCommandSendCaptureDevices extends HeartbeatCommandBase {
	type: HeartbeatCommandType.SendCaptureDevices
}

export interface HeartbeatCommandCheckJobCanRun extends HeartbeatCommandBase {
	type: HeartbeatCommandType.CheckJobCanRun
}

export type HeartbeatCommand =
	HeartbeatCommandSendSystemInfo | HeartbeatCommandSendCaptureDevices | HeartbeatCommandCheckJobCanRun
