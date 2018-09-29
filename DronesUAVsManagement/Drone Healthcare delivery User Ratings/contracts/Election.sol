pragma solidity ^0.4.2;

contract Election{
    //Model a Candidate
    struct Candidate{
        uint id;
        string name;
        uint voteCount;
        uint num;
    }
    //Store accounts that have voted
    mapping(address => bool) public voters;
    //Store Candidates
    //Fetch Candidates
    mapping(uint => Candidate) public candidates;
    //Store Candidates Count
    uint public candidatesCount;

    //voted event
    event votedEvent (
        uint indexed _candidateID
    );
    function Election () public {
        addCandidate("Drone 1");
        addCandidate("Drone 2");
    }

    function addCandidate (string _name) private{
        candidatesCount++;
        candidates[candidatesCount] = Candidate(candidatesCount, _name, 0, 0);
    }

    function vote(uint _candidateID, uint _rating) public {
        //require that they have not voted before
        // require(!voters[msg.sender]);
        //require a valid candidate
        require(_candidateID > 0 && _candidateID <= candidatesCount);
        //record that voter has voted
        // voters[msg.sender] = true ;
        //update candidate vote Count
        uint temp = candidates[_candidateID].voteCount * candidates[_candidateID].num;
        candidates[_candidateID].num++;
        temp = (temp + _rating)/candidates[_candidateID].num;
        candidates[_candidateID].voteCount = temp;

        //trigger voted voted
        votedEvent(_candidateID);
    }
}
