formula for calculating rank:
1star - base stage
if the only stage we played was the 1 star level, then our rank would base
1 +- 0.15
it depends on the time we took to click all of the wawas. if we took 10seconds, we would be 1.05star ranked.
if we took 25 seconds, we would be 0.90star ranked.
its basically (star_rating+0.15)-timetooktowin/100
the timetooktowin is always 0-30
if we played more stages, we would add all of the rankings together (so for example, if we got a 1.05star rank and then a 0.96 star rank, it would end up in a 1.01star rank)
to calculate a stage's star rank:
rank = star_rating + (0.15 - (time_taken / 100))
Where:
- star_rating is the base star rating of the stage (1, 2, or 3)
- time_taken is the time taken to complete the stage in seconds (capped between 0 and 30 seconds)
The final rank is the sum of the ranks from all played stages.
You can use the following formula to scale the time_taken value to be between 0 and 30 seconds:
scaled_time_taken = (time_taken / max_time) * 30;