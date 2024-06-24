import pygit2
import os
import json
from datetime import datetime, timedelta
import msgspec

# Define the structure of the JSON data using msgspec
class PowerbankData(msgspec.Struct):
    id: str
    totalAvailablePowerbanks: int

# Function to check if a location has always had totalAvailablePowerbanks=0
def check_dead_location(commits, repo):
    all_locations = set()
    alive_locations = set()

    for commit in commits:
        try:
            tree = commit.tree
            if '_data/plugo.json' in tree:
                blob = repo[tree['_data/plugo.json'].id]
                file_content = blob.data.decode('utf-8')
                data = msgspec.json.decode(file_content, type=list[PowerbankData])

                for item in data:
                    location_id = item.id
                    total_powerbanks = item.totalAvailablePowerbanks
                    all_locations.add(location_id)

                    if total_powerbanks != 0:
                        alive_locations.add(location_id)
        
        except KeyError:
            pass
    
    return sorted(list(all_locations - alive_locations))

# Main function to iterate through commits and identify dead locations
def main():
    # Open the repository
    repo_path = '.'  # Assuming the script is run from the root of the repository
    repo = pygit2.Repository(repo_path)

    # Determine the date range (last two weeks)
    today = datetime.today()
    two_weeks_ago = today - timedelta(weeks=2)

    # Collect commits within the date range
    commits = list(repo.walk(repo.head.target, pygit2.GIT_SORT_TOPOLOGICAL))
    commits_within_range = [
        commit for commit in commits
        if datetime.fromtimestamp(commit.commit_time) >= two_weeks_ago
    ]

    # Check for dead locations
    dead_locations = check_dead_location(commits_within_range, repo)

    # Write dead_locations to JSON file
    output_file = '_data/dead.json'
    with open(output_file, 'w') as f:
        json.dump(list(dead_locations), f, indent=2)

    print(f"Dead locations written to {output_file}")

if __name__ == "__main__":
    main()
