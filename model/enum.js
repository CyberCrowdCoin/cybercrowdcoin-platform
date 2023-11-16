
const DemandStatusEnum = {
    // open/completed
    OPEN : 'open',
    ONGOING : 'ongoing',
    COMPLETED : 'completed'
}

function getDemandStatusEnumValue (name){
    return DemandStatusEnum[name]
}

const CandidateStatusEnum = {
    VALID : 'valid',
    UNVALID : 'unvalid'
}

const ConfigKeyEnum = {
    BLOCK_NUMBER : 'blockNumber'
}

const ProtocolStatusEnum = {
    // proposal pending" "active" "invite pending" "finished" "cancelled"
    PROPOSAL_PENDING : 'proposal pending',
    INVITE_PENDING : 'invite pending',
    ACTIVE : 'active',
    ACTIVE_PENDING : 'active pending',
    FINISHED : 'finished',
    INVITE_CANCEL : 'invite cancel',
    PROPOSAL_REFUSED : 'proposal refused',
    INVITE_REFUSED : 'invite refused'
}

const ProtocolMessageTypeEnum = {
    INVITATION_SEND : 'invitation send',
    PROPOSAL_SEND : 'proposal send',
    INVITATION_ACCEPT : 'invitation accept',
    PROPOSAL_ACCETP : 'proposal accept',
    INVITATION_REFUSED : 'invitation refuse',
    PROPOSAL_REFUSED : 'proposal refuse',
    INVITATION_CANCEL : 'invitation cancel',
    PROTOCOL_FINISH : 'protocol finish'
}

module.exports = { CandidateStatusEnum, DemandStatusEnum, ProtocolStatusEnum, ProtocolMessageTypeEnum, ConfigKeyEnum}